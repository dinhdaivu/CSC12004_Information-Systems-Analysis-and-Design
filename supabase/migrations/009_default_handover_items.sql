-- Migration 009: default handover items per room type.
-- Replaces the frontend hardcoded "Room Keys / AC Remote / ..." defaults so
-- admins can edit them without redeploying code.
--
-- Convention:
--   room_type_match = '*'      → applied to every room type (base items)
--   room_type_match = 'dorm'   → applied if room.room_type LIKE '%dorm%'
--   room_type_match = 'studio' → applied if room.room_type LIKE '%studio%'
--   etc.

CREATE TABLE IF NOT EXISTS public.default_handover_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_type_match TEXT NOT NULL,       -- '*' or a substring like 'dorm', 'studio', 'single'
    item_name TEXT NOT NULL,
    default_condition TEXT NOT NULL DEFAULT 'Good',
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (room_type_match, item_name)
);

CREATE INDEX IF NOT EXISTS idx_default_handover_items_active ON public.default_handover_items(active);
CREATE INDEX IF NOT EXISTS idx_default_handover_items_match ON public.default_handover_items(room_type_match);

DROP TRIGGER IF EXISTS update_default_handover_items_updated_at ON public.default_handover_items;
CREATE TRIGGER update_default_handover_items_updated_at
BEFORE UPDATE ON public.default_handover_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.default_handover_items ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated may read (the admin handover form needs them); only staff manage.
DROP POLICY IF EXISTS default_handover_items_read ON public.default_handover_items;
CREATE POLICY default_handover_items_read ON public.default_handover_items
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS default_handover_items_staff_manage ON public.default_handover_items;
CREATE POLICY default_handover_items_staff_manage ON public.default_handover_items
FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Seed with the same defaults that were hardcoded in
-- frontend/.../handovers.component.ts onContractSelect().
INSERT INTO public.default_handover_items (room_type_match, item_name, default_condition, sort_order) VALUES
    ('*', 'Room Keys', 'Good', 10),
    ('*', 'AC Remote', 'Good', 20),
    ('dorm', 'Bunk Bed', 'Good', 30),
    ('dorm', 'Locker Key', 'Good', 40),
    ('studio', 'Bed & Mattress', 'Good', 30),
    ('studio', 'Wardrobe', 'Good', 40),
    ('studio', 'Desk & Chair', 'Good', 50),
    ('single', 'Bed & Mattress', 'Good', 30),
    ('single', 'Wardrobe', 'Good', 40),
    ('single', 'Desk & Chair', 'Good', 50)
ON CONFLICT (room_type_match, item_name) DO NOTHING;
