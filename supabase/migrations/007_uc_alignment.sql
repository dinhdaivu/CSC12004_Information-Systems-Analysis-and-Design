-- Migration 007: align schema with UC1-UC4 spec (§3.1.1-3.1.4).
-- Adds:
--   * rental_mode enum + column (UC1: WHOLE_ROOM vs SHARED_BED)
--   * priority criteria, expected dates, gender preference (UC1)
--   * rental_request_id on contracts (UC3 traceability)
--   * contract_services join (UC3: itemized service fees)
--   * handover signature URLs (UC3 signed minutes)
--   * checkout_inspections table (UC4 physical inspection record)
--   * key_returns checklist (UC4 key/card return)
--   * settlement customer signature (UC4)
--   * damage_reports (UC4 structured damage tracking)
--
-- All changes are additive / nullable so existing data continues to work.

-- ========================
-- ENUMS
-- ========================

DO $$
BEGIN
    CREATE TYPE public.rental_mode AS ENUM ('whole_room', 'shared_bed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========================
-- UC1: rooms gender policy (for gender-based matching)
-- ========================

DO $$
BEGIN
    CREATE TYPE public.gender_policy AS ENUM ('male', 'female', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.rooms
    ADD COLUMN IF NOT EXISTS gender_policy public.gender_policy NOT NULL DEFAULT 'mixed';

CREATE INDEX IF NOT EXISTS idx_rooms_gender_policy ON public.rooms(gender_policy);

-- ========================
-- UC1: rental_requests enrichment
-- ========================

ALTER TABLE public.rental_requests
    ADD COLUMN IF NOT EXISTS rental_mode public.rental_mode,
    ADD COLUMN IF NOT EXISTS preferred_gender TEXT,
    ADD COLUMN IF NOT EXISTS expected_move_in_date DATE,
    ADD COLUMN IF NOT EXISTS rental_duration_months INT CHECK (rental_duration_months IS NULL OR rental_duration_months > 0),
    ADD COLUMN IF NOT EXISTS prefers_quiet BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS needs_parking BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS needs_air_conditioner BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS schedule_note TEXT;

-- ========================
-- UC3: contracts ↔ services itemization
-- ========================

ALTER TABLE public.contracts
    ADD COLUMN IF NOT EXISTS rental_request_id UUID REFERENCES public.rental_requests(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS rental_mode public.rental_mode,
    ADD COLUMN IF NOT EXISTS beds_count INT CHECK (beds_count IS NULL OR beds_count > 0);

CREATE TABLE IF NOT EXISTS public.contract_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (contract_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_contract_services_contract ON public.contract_services(contract_id);

ALTER TABLE public.contract_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contract_services_read ON public.contract_services;
CREATE POLICY contract_services_read ON public.contract_services
FOR SELECT TO authenticated
USING (
    public.is_staff()
    OR EXISTS (
        SELECT 1 FROM public.contracts c
        WHERE c.id = contract_services.contract_id
          AND c.customer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS contract_services_staff_manage ON public.contract_services;
CREATE POLICY contract_services_staff_manage ON public.contract_services
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

-- ========================
-- UC3: handover signed minutes
-- ========================

ALTER TABLE public.handovers
    ADD COLUMN IF NOT EXISTS manager_signature_url TEXT,
    ADD COLUMN IF NOT EXISTS customer_signature_url TEXT,
    ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- ========================
-- UC4: checkout-side inspection
-- ========================

DO $$
BEGIN
    CREATE TYPE public.checkout_inspection_status AS ENUM ('pending', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.checkout_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_request_id UUID NOT NULL REFERENCES public.checkout_requests(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    inspected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cleanliness_note TEXT,
    overall_condition TEXT,
    status public.checkout_inspection_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (checkout_request_id)
);

CREATE INDEX IF NOT EXISTS idx_checkout_inspections_checkout ON public.checkout_inspections(checkout_request_id);

DROP TRIGGER IF EXISTS update_checkout_inspections_updated_at ON public.checkout_inspections;
CREATE TRIGGER update_checkout_inspections_updated_at
BEFORE UPDATE ON public.checkout_inspections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.damage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_inspection_id UUID NOT NULL REFERENCES public.checkout_inspections(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    description TEXT,
    estimated_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_cost >= 0),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_damage_reports_inspection ON public.damage_reports(checkout_inspection_id);

-- Key/card return checklist: one row per asset returned at checkout.
CREATE TABLE IF NOT EXISTS public.key_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_inspection_id UUID NOT NULL REFERENCES public.checkout_inspections(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    returned BOOLEAN NOT NULL DEFAULT false,
    replacement_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (replacement_cost >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_key_returns_inspection ON public.key_returns(checkout_inspection_id);

ALTER TABLE public.checkout_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_returns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS checkout_inspections_read ON public.checkout_inspections;
CREATE POLICY checkout_inspections_read ON public.checkout_inspections
FOR SELECT TO authenticated
USING (
    public.is_staff()
    OR EXISTS (
        SELECT 1 FROM public.checkout_requests cr
        WHERE cr.id = checkout_inspections.checkout_request_id
          AND cr.customer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS checkout_inspections_staff_manage ON public.checkout_inspections;
CREATE POLICY checkout_inspections_staff_manage ON public.checkout_inspections
FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS damage_reports_read ON public.damage_reports;
CREATE POLICY damage_reports_read ON public.damage_reports
FOR SELECT TO authenticated
USING (
    public.is_staff()
    OR EXISTS (
        SELECT 1 FROM public.checkout_inspections ci
        JOIN public.checkout_requests cr ON cr.id = ci.checkout_request_id
        WHERE ci.id = damage_reports.checkout_inspection_id
          AND cr.customer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS damage_reports_staff_manage ON public.damage_reports;
CREATE POLICY damage_reports_staff_manage ON public.damage_reports
FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS key_returns_read ON public.key_returns;
CREATE POLICY key_returns_read ON public.key_returns
FOR SELECT TO authenticated
USING (
    public.is_staff()
    OR EXISTS (
        SELECT 1 FROM public.checkout_inspections ci
        JOIN public.checkout_requests cr ON cr.id = ci.checkout_request_id
        WHERE ci.id = key_returns.checkout_inspection_id
          AND cr.customer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS key_returns_staff_manage ON public.key_returns;
CREATE POLICY key_returns_staff_manage ON public.key_returns
FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

-- ========================
-- UC4: settlement signed report
-- ========================

ALTER TABLE public.settlements
    ADD COLUMN IF NOT EXISTS customer_signature_url TEXT,
    ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;
