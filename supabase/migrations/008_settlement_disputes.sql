-- Migration 008: settlement_disputes table for the customer dispute flow
-- (UC4 §3.1.4 — customer disagrees with settlement breakdown).

DO $$
BEGIN
    CREATE TYPE public.dispute_status AS ENUM ('pending', 'reviewing', 'resolved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.settlement_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id UUID REFERENCES public.settlements(id) ON DELETE SET NULL,
    checkout_request_id UUID REFERENCES public.checkout_requests(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    branch TEXT,
    reason TEXT NOT NULL,
    evidence_url TEXT,
    status public.dispute_status NOT NULL DEFAULT 'pending',
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resolution_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disputes_customer ON public.settlement_disputes(customer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_settlement ON public.settlement_disputes(settlement_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.settlement_disputes(status);

DROP TRIGGER IF EXISTS update_settlement_disputes_updated_at ON public.settlement_disputes;
CREATE TRIGGER update_settlement_disputes_updated_at
BEFORE UPDATE ON public.settlement_disputes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.settlement_disputes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS disputes_read ON public.settlement_disputes;
CREATE POLICY disputes_read ON public.settlement_disputes
FOR SELECT TO authenticated
USING (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS disputes_customer_insert ON public.settlement_disputes;
CREATE POLICY disputes_customer_insert ON public.settlement_disputes
FOR INSERT TO authenticated
WITH CHECK (customer_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS disputes_staff_manage ON public.settlement_disputes;
CREATE POLICY disputes_staff_manage ON public.settlement_disputes
FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());
