-- Migration 011: lodging_eligibility table
--
-- Replaces the in-memory InMemoryEligibilityStore in the Express backend with a
-- proper persistent table. The Express service used a Map keyed by customer_id
-- (upsert semantics — one record per customer), storing the manual checklist
-- inputs and the computed eligible/ineligible decision.
--
-- Fields map directly to LodgingEligibilityCheckInput from the Express model.

CREATE TABLE IF NOT EXISTS public.lodging_eligibility (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    checked_by              UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    identity_verified       BOOLEAN NOT NULL,
    documents_complete      BOOLEAN NOT NULL,
    background_check_passed BOOLEAN NOT NULL,
    health_requirements_met BOOLEAN,
    decision                TEXT NOT NULL CHECK (decision IN ('eligible', 'ineligible')),
    reasons                 TEXT[] NOT NULL DEFAULT '{}',
    notes                   TEXT,
    checked_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (customer_id)    -- one active record per customer; re-check upserts it
);

CREATE INDEX IF NOT EXISTS idx_lodging_eligibility_customer
    ON public.lodging_eligibility (customer_id);

CREATE INDEX IF NOT EXISTS idx_lodging_eligibility_decision
    ON public.lodging_eligibility (decision);

DO $$ BEGIN
    CREATE TRIGGER update_lodging_eligibility_updated_at
        BEFORE UPDATE ON public.lodging_eligibility
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
