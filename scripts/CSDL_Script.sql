-- Initial database schema for HomeStay Dorm.
-- Source of truth for task 00-02: database foundation + RLS.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================
-- ENUM TYPES
-- ========================

DO $$
BEGIN
    CREATE TYPE public.app_role AS ENUM ('customer', 'sale', 'accountant', 'manager', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.user_status AS ENUM ('active', 'inactive', 'banned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.room_status AS ENUM ('available', 'holding', 'deposited', 'occupied', 'checkout_pending', 'maintenance');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.bed_status AS ENUM ('available', 'holding', 'deposited', 'occupied', 'maintenance');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.rental_request_status AS ENUM ('requested', 'reviewing', 'viewing_scheduled', 'accepted', 'rejected', 'cancelled', 'deposit_pending', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.viewing_appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.deposit_status AS ENUM ('pending', 'paid', 'cancelled', 'expired', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.contract_status AS ENUM ('active', 'terminated', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.checkout_status AS ENUM ('requested', 'confirmed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.settlement_status AS ENUM ('draft', 'confirmed', 'paid', 'refunded', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.handover_status AS ENUM ('pending', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.payment_type AS ENUM ('rent', 'deposit', 'refund', 'fee');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.payment_method AS ENUM ('cash', 'transfer', 'vietqr');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE public.invoice_status AS ENUM ('unpaid', 'paid', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ========================
-- HELPER FUNCTIONS
-- ========================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ========================
-- CORE TABLES
-- ========================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    identity_number TEXT UNIQUE,
    gender TEXT,
    nationality TEXT,
    avatar_url TEXT,
    role public.app_role NOT NULL DEFAULT 'customer',
    status public.user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(public.current_app_role() IN ('sale', 'accountant', 'manager', 'admin'), false)
$$;

REVOKE ALL ON FUNCTION public.current_app_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    phone TEXT,
    description TEXT,
    hero_image_url TEXT,
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    room_type TEXT,
    max_capacity INT NOT NULL CHECK (max_capacity > 0),
    price_per_month NUMERIC(12, 2) NOT NULL CHECK (price_per_month >= 0),
    amenities TEXT[] NOT NULL DEFAULT '{}',
    images_url TEXT[] NOT NULL DEFAULT '{}',
    status public.room_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (branch_id, room_number)
);

CREATE TABLE IF NOT EXISTS public.beds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    bed_number TEXT NOT NULL,
    price_per_month NUMERIC(12, 2) CHECK (price_per_month >= 0),
    status public.bed_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (room_id, bed_number)
);

CREATE TABLE IF NOT EXISTS public.rental_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    bed_id UUID REFERENCES public.beds(id) ON DELETE SET NULL,
    preferred_room_type TEXT,
    budget_min NUMERIC(12, 2) CHECK (budget_min IS NULL OR budget_min >= 0),
    budget_max NUMERIC(12, 2) CHECK (budget_max IS NULL OR budget_max >= 0),
    people_count INT NOT NULL DEFAULT 1 CHECK (people_count > 0),
    note TEXT,
    status public.rental_request_status NOT NULL DEFAULT 'requested',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max)
);

CREATE TABLE IF NOT EXISTS public.viewing_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_request_id UUID NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    bed_id UUID REFERENCES public.beds(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    result_note TEXT,
    status public.viewing_appointment_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deposit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_request_id UUID REFERENCES public.rental_requests(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    bed_id UUID REFERENCES public.beds(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    due_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
    paid_at TIMESTAMPTZ,
    proof_image_url TEXT,
    status public.deposit_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    deposit_request_id UUID REFERENCES public.deposit_requests(id) ON DELETE SET NULL,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
    bed_id UUID REFERENCES public.beds(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_price NUMERIC(12, 2) NOT NULL CHECK (monthly_price >= 0),
    status public.contract_status NOT NULL DEFAULT 'active',
    contract_document_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_date > start_date)
);

CREATE TABLE IF NOT EXISTS public.handovers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    handover_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status public.handover_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.handover_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handover_id UUID NOT NULL REFERENCES public.handovers(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    item_condition TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.checkout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    requested_checkout_date DATE NOT NULL,
    reason TEXT,
    status public.checkout_status NOT NULL DEFAULT 'requested',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    checkout_request_id UUID NOT NULL REFERENCES public.checkout_requests(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    deposit_request_id UUID REFERENCES public.deposit_requests(id) ON DELETE SET NULL,
    deposit_total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (deposit_total >= 0),
    refund_rate NUMERIC(5, 4) NOT NULL DEFAULT 0 CHECK (refund_rate >= 0 AND refund_rate <= 1),
    deduction NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (deduction >= 0),
    final_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    payment_method public.payment_method,
    status public.settlement_status NOT NULL DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    deposit_request_id UUID REFERENCES public.deposit_requests(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    settlement_id UUID REFERENCES public.settlements(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    type public.payment_type NOT NULL,
    status public.payment_status NOT NULL DEFAULT 'pending',
    payment_method public.payment_method NOT NULL,
    vietqr_reference TEXT,
    proof_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    period_start DATE,
    period_end DATE,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status public.invoice_status NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (period_start IS NULL OR period_end IS NULL OR period_end >= period_start)
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================
-- UPDATED_AT TRIGGERS
-- ========================

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_branches_updated_at ON public.branches;
CREATE TRIGGER update_branches_updated_at
BEFORE UPDATE ON public.branches
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_beds_updated_at ON public.beds;
CREATE TRIGGER update_beds_updated_at
BEFORE UPDATE ON public.beds
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_rental_requests_updated_at ON public.rental_requests;
CREATE TRIGGER update_rental_requests_updated_at
BEFORE UPDATE ON public.rental_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_viewing_appointments_updated_at ON public.viewing_appointments;
CREATE TRIGGER update_viewing_appointments_updated_at
BEFORE UPDATE ON public.viewing_appointments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_deposit_requests_updated_at ON public.deposit_requests;
CREATE TRIGGER update_deposit_requests_updated_at
BEFORE UPDATE ON public.deposit_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_handovers_updated_at ON public.handovers;
CREATE TRIGGER update_handovers_updated_at
BEFORE UPDATE ON public.handovers
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_checkout_requests_updated_at ON public.checkout_requests;
CREATE TRIGGER update_checkout_requests_updated_at
BEFORE UPDATE ON public.checkout_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_settlements_updated_at ON public.settlements;
CREATE TRIGGER update_settlements_updated_at
BEFORE UPDATE ON public.settlements
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_payments_updated_at ON public.payments;
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========================
-- INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_branches_manager ON public.branches(manager_id);
CREATE INDEX IF NOT EXISTS idx_rooms_branch_status ON public.rooms(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON public.rooms(price_per_month);
CREATE INDEX IF NOT EXISTS idx_beds_room_status ON public.beds(room_id, status);
CREATE INDEX IF NOT EXISTS idx_rental_requests_customer_status ON public.rental_requests(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_rental_requests_branch_status ON public.rental_requests(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_viewing_appointments_sale_date ON public.viewing_appointments(sale_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_viewing_appointments_customer_date ON public.viewing_appointments(customer_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_customer_status ON public.deposit_requests(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_room_status ON public.deposit_requests(room_id, status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_due_at ON public.deposit_requests(due_at);
CREATE INDEX IF NOT EXISTS idx_contracts_customer_status ON public.contracts(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_contracts_room_status ON public.contracts(room_id, status);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON public.contracts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_handovers_contract ON public.handovers(contract_id);
CREATE INDEX IF NOT EXISTS idx_checkout_requests_customer_status ON public.checkout_requests(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_checkout_requests_contract ON public.checkout_requests(contract_id);
CREATE INDEX IF NOT EXISTS idx_settlements_checkout_status ON public.settlements(checkout_request_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_contract_type ON public.payments(contract_id, type);
CREATE INDEX IF NOT EXISTS idx_invoices_contract_status ON public.invoices(contract_id, status);

-- ========================
-- API ROLE GRANTS
-- ========================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON
    public.branches,
    public.rooms,
    public.beds,
    public.services
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ========================
-- ROW LEVEL SECURITY
-- ========================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handover_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_self_select ON public.users;
CREATE POLICY users_self_select ON public.users
FOR SELECT TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS users_self_insert ON public.users;
CREATE POLICY users_self_insert ON public.users
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS users_staff_manage ON public.users;
CREATE POLICY users_staff_manage ON public.users
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS branches_public_read ON public.branches;
CREATE POLICY branches_public_read ON public.branches
FOR SELECT
USING (true);

DROP POLICY IF EXISTS branches_staff_manage ON public.branches;
CREATE POLICY branches_staff_manage ON public.branches
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS rooms_public_read ON public.rooms;
CREATE POLICY rooms_public_read ON public.rooms
FOR SELECT
USING (true);

DROP POLICY IF EXISTS rooms_staff_manage ON public.rooms;
CREATE POLICY rooms_staff_manage ON public.rooms
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS beds_public_read ON public.beds;
CREATE POLICY beds_public_read ON public.beds
FOR SELECT
USING (true);

DROP POLICY IF EXISTS beds_staff_manage ON public.beds;
CREATE POLICY beds_staff_manage ON public.beds
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS rental_requests_customer_read ON public.rental_requests;
CREATE POLICY rental_requests_customer_read ON public.rental_requests
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS rental_requests_customer_insert ON public.rental_requests;
CREATE POLICY rental_requests_customer_insert ON public.rental_requests
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS rental_requests_customer_update ON public.rental_requests;
CREATE POLICY rental_requests_customer_update ON public.rental_requests
FOR UPDATE TO authenticated
USING (customer_id = auth.uid() OR public.is_staff())
WITH CHECK (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS viewing_appointments_read ON public.viewing_appointments;
CREATE POLICY viewing_appointments_read ON public.viewing_appointments
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS viewing_appointments_staff_manage ON public.viewing_appointments;
CREATE POLICY viewing_appointments_staff_manage ON public.viewing_appointments
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS deposit_requests_read ON public.deposit_requests;
CREATE POLICY deposit_requests_read ON public.deposit_requests
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS deposit_requests_customer_insert ON public.deposit_requests;
CREATE POLICY deposit_requests_customer_insert ON public.deposit_requests
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS deposit_requests_staff_manage ON public.deposit_requests;
CREATE POLICY deposit_requests_staff_manage ON public.deposit_requests
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS contracts_read ON public.contracts;
CREATE POLICY contracts_read ON public.contracts
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS contracts_staff_manage ON public.contracts;
CREATE POLICY contracts_staff_manage ON public.contracts
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS handovers_read ON public.handovers;
CREATE POLICY handovers_read ON public.handovers
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS handovers_staff_manage ON public.handovers;
CREATE POLICY handovers_staff_manage ON public.handovers
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS handover_items_read ON public.handover_items;
CREATE POLICY handover_items_read ON public.handover_items
FOR SELECT TO authenticated
USING (
    public.is_staff()
    OR EXISTS (
        SELECT 1
        FROM public.handovers h
        WHERE h.id = handover_items.handover_id
          AND h.customer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS handover_items_staff_manage ON public.handover_items;
CREATE POLICY handover_items_staff_manage ON public.handover_items
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS checkout_requests_read ON public.checkout_requests;
CREATE POLICY checkout_requests_read ON public.checkout_requests
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS checkout_requests_customer_insert ON public.checkout_requests;
CREATE POLICY checkout_requests_customer_insert ON public.checkout_requests
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS checkout_requests_update ON public.checkout_requests;
CREATE POLICY checkout_requests_update ON public.checkout_requests
FOR UPDATE TO authenticated
USING (customer_id = auth.uid() OR public.is_staff())
WITH CHECK (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS settlements_read ON public.settlements;
CREATE POLICY settlements_read ON public.settlements
FOR SELECT TO authenticated
USING (
    public.is_staff()
    OR EXISTS (
        SELECT 1
        FROM public.contracts c
        WHERE c.id = settlements.contract_id
          AND c.customer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS settlements_staff_manage ON public.settlements;
CREATE POLICY settlements_staff_manage ON public.settlements
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS payments_read ON public.payments;
CREATE POLICY payments_read ON public.payments
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS payments_customer_insert ON public.payments;
CREATE POLICY payments_customer_insert ON public.payments
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS payments_staff_manage ON public.payments;
CREATE POLICY payments_staff_manage ON public.payments
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS services_public_read ON public.services;
CREATE POLICY services_public_read ON public.services
FOR SELECT
USING (active = true);

DROP POLICY IF EXISTS services_staff_manage ON public.services;
CREATE POLICY services_staff_manage ON public.services
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS invoices_read ON public.invoices;
CREATE POLICY invoices_read ON public.invoices
FOR SELECT TO authenticated
USING (
    public.is_staff()
    OR EXISTS (
        SELECT 1
        FROM public.contracts c
        WHERE c.id = invoices.contract_id
          AND c.customer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS invoices_staff_manage ON public.invoices;
CREATE POLICY invoices_staff_manage ON public.invoices
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS invoice_items_read ON public.invoice_items;
CREATE POLICY invoice_items_read ON public.invoice_items
FOR SELECT TO authenticated
USING (
    public.is_staff()
    OR EXISTS (
        SELECT 1
        FROM public.invoices i
        JOIN public.contracts c ON c.id = i.contract_id
        WHERE i.id = invoice_items.invoice_id
          AND c.customer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS invoice_items_staff_manage ON public.invoice_items;
CREATE POLICY invoice_items_staff_manage ON public.invoice_items
FOR ALL TO authenticated
USING (public.is_staff())
WITH CHECK (public.is_staff());
