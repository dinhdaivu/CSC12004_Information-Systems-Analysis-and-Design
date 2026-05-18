-- ============================================================
-- add_rooms.sql
-- Run this in the Supabase SQL Editor to add more rooms.
-- Safe to re-run — uses ON CONFLICT DO NOTHING.
-- ============================================================

-- ============================================================
-- New Rooms (only the additions — existing rooms are skipped)
-- ============================================================
INSERT INTO public.rooms (branch_id, zone_id, room_number, room_type, max_capacity, price_per_month, amenities, status)
SELECT b.id, z.id, r.room_number, r.room_type, r.max_capacity, r.price_per_month, r.amenities, r.status::public.room_status
FROM (
    VALUES
        -- Tô Hiến Thành
        ('Tô Hiến Thành', 'Floor 1 - Female Zone', 'THT-102', 'Single', 1, 3500000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom', 'wardrobe'],            'available'),
        ('Tô Hiến Thành', 'Floor 1 - Male Zone', 'THT-202', 'Shared', 4, 1800000.00, ARRAY['wifi', 'air_conditioner', 'shared_bathroom', 'locker'],              'available'),
        ('Tô Hiến Thành', 'Floor 2 - Female Zone', 'THT-301', 'Double', 2, 2800000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom', 'wardrobe', 'balcony'],'available'),
        ('Tô Hiến Thành', 'Floor 2 - Female Zone', 'THT-302', 'Double', 2, 2800000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom', 'wardrobe'],           'available'),

        -- Trần Não
        ('Trần Não', 'Floor 1 - Female Zone', 'TN-102', 'Single', 1, 3200000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom', 'wardrobe'],                 'available'),
        ('Trần Não', 'Floor 1 - Male Zone', 'TN-203', 'Shared', 4, 1600000.00, ARRAY['wifi', 'air_conditioner', 'shared_bathroom', 'locker'],                    'available'),
        ('Trần Não', 'Floor 2 - Female Zone', 'TN-301', 'Double', 2, 2600000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom', 'wardrobe'],                 'available'),
        ('Trần Não', 'Floor 2 - Female Zone', 'TN-302', 'Double', 2, 2600000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom', 'wardrobe', 'balcony'],      'available'),

        -- Nguyễn Cửu Vân
        ('Nguyễn Cửu Vân', 'Floor 1 - Female Zone', 'NCV-102', 'Single', 1, 3800000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom', 'wardrobe'],          'available'),
        ('Nguyễn Cửu Vân', 'Floor 1 - Male Zone', 'NCV-204', 'Shared', 6, 1700000.00, ARRAY['wifi', 'shared_bathroom', 'locker'],                               'available'),
        ('Nguyễn Cửu Vân', 'Floor 2 - Female Zone', 'NCV-301', 'Double', 2, 3100000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom', 'wardrobe', 'balcony'],'available'),
        ('Nguyễn Cửu Vân', 'Floor 2 - Female Zone', 'NCV-302', 'Double', 2, 3100000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom', 'wardrobe'],          'available')
) AS r(branch_name, zone_name, room_number, room_type, max_capacity, price_per_month, amenities, status)
JOIN public.branches b ON b.name = r.branch_name
JOIN public.zones z ON z.name = r.zone_name AND z.branch_id = b.id
ON CONFLICT (branch_id, room_number) DO UPDATE
SET zone_id = EXCLUDED.zone_id,
    room_type = EXCLUDED.room_type,
    max_capacity = EXCLUDED.max_capacity,
    price_per_month = EXCLUDED.price_per_month,
    amenities = EXCLUDED.amenities,
    status = EXCLUDED.status,
    updated_at = now();

-- ============================================================
-- New Beds for the new rooms
-- ============================================================
INSERT INTO public.beds (room_id, bed_number, price_per_month, status)
SELECT r.id, b.bed_number, b.price_per_month, b.status::public.bed_status
FROM (
    VALUES
        -- THT-102 Single
        ('THT-102', 'A', 3500000.00, 'available'),
        -- THT-202 Shared (4 beds)
        ('THT-202', 'A', 1800000.00, 'available'),
        ('THT-202', 'B', 1800000.00, 'available'),
        ('THT-202', 'C', 1800000.00, 'available'),
        ('THT-202', 'D', 1800000.00, 'available'),
        -- THT-301 Double
        ('THT-301', 'A', 2800000.00, 'available'),
        ('THT-301', 'B', 2800000.00, 'available'),
        -- THT-302 Double
        ('THT-302', 'A', 2800000.00, 'available'),
        ('THT-302', 'B', 2800000.00, 'available'),

        -- TN-102 Single
        ('TN-102', 'A', 3200000.00, 'available'),
        -- TN-203 Shared (4 beds)
        ('TN-203', 'A', 1600000.00, 'available'),
        ('TN-203', 'B', 1600000.00, 'available'),
        ('TN-203', 'C', 1600000.00, 'available'),
        ('TN-203', 'D', 1600000.00, 'available'),
        -- TN-301 Double
        ('TN-301', 'A', 2600000.00, 'available'),
        ('TN-301', 'B', 2600000.00, 'available'),
        -- TN-302 Double
        ('TN-302', 'A', 2600000.00, 'available'),
        ('TN-302', 'B', 2600000.00, 'available'),

        -- NCV-102 Single
        ('NCV-102', 'A', 3800000.00, 'available'),
        -- NCV-204 Shared (6 beds)
        ('NCV-204', 'A', 1700000.00, 'available'),
        ('NCV-204', 'B', 1700000.00, 'available'),
        ('NCV-204', 'C', 1700000.00, 'available'),
        ('NCV-204', 'D', 1700000.00, 'available'),
        ('NCV-204', 'E', 1700000.00, 'available'),
        ('NCV-204', 'F', 1700000.00, 'available'),
        -- NCV-301 Double
        ('NCV-301', 'A', 3100000.00, 'available'),
        ('NCV-301', 'B', 3100000.00, 'available'),
        -- NCV-302 Double
        ('NCV-302', 'A', 3100000.00, 'available'),
        ('NCV-302', 'B', 3100000.00, 'available')
) AS b(room_number, bed_number, price_per_month, status)
JOIN public.rooms r ON r.room_number = b.room_number
ON CONFLICT (room_id, bed_number) DO NOTHING;

-- ============================================================
-- Verify results
-- ============================================================
SELECT
    br.name AS branch,
    ro.room_number,
    ro.room_type,
    ro.max_capacity,
    ro.price_per_month,
    ro.status,
    COUNT(be.id) AS bed_count
FROM public.rooms ro
JOIN public.branches br ON br.id = ro.branch_id
LEFT JOIN public.beds be ON be.room_id = ro.id
GROUP BY br.name, ro.room_number, ro.room_type, ro.max_capacity, ro.price_per_month, ro.status
ORDER BY br.name, ro.room_number;
