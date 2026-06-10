-- Create zones table required by ZoneEntity / ZoneJpaRepository.
-- A zone groups rooms within a branch (e.g. Block A, Floor 2).

CREATE TABLE IF NOT EXISTS public.zones (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id   UUID        NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS zones_branch_id_idx ON public.zones(branch_id);
