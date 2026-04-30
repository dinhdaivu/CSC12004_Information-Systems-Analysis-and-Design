-- HomeStay Dorm Seed Data
-- Initial data for local Supabase development and demo checks.
--
-- Usage:
--   supabase db reset
--   or: psql -f supabase/seed.sql
--
-- Note:
--   Users must be created via Supabase Auth (Dashboard or API).
--   This seed only inserts public/reference data that does not need auth user IDs.

-- ============================================
-- 1. Branches
-- ============================================
INSERT INTO public.branches (name, address, description, hero_image_url, phone)
VALUES
    (
        'Tô Hiến Thành',
        'Tô Hiến Thành, District 10, Ho Chi Minh City',
        'HomeStay Dorm branch used by homepage and room detail flows.',
        'assets/pictures/Homepage Tô Hiến Thành.png',
        '0900000001'
    ),
    (
        'Trần Não',
        'Tran Nao, Thu Duc City, Ho Chi Minh City',
        'HomeStay Dorm branch used by homepage and room discovery flows.',
        'assets/pictures/Homepage Trần Não.png',
        '0900000002'
    ),
    (
        'Nguyễn Cửu Vân',
        'Nguyen Cuu Van, Binh Thanh District, Ho Chi Minh City',
        'HomeStay Dorm branch used by homepage and room detail flows.',
        'assets/pictures/Homepage Nguyễn Cửu Vân.png',
        '0900000003'
    )
ON CONFLICT (name) DO UPDATE
SET address = EXCLUDED.address,
    description = EXCLUDED.description,
    hero_image_url = EXCLUDED.hero_image_url,
    phone = EXCLUDED.phone,
    updated_at = now();

-- ============================================
-- 2. Sample Rooms
-- ============================================
INSERT INTO public.rooms (branch_id, room_number, room_type, max_capacity, price_per_month, amenities, status)
SELECT b.id, r.room_number, r.room_type, r.max_capacity, r.price_per_month, r.amenities, r.status::public.room_status
FROM (
    VALUES
        ('Tô Hiến Thành', 'THT-101', 'Single', 1, 3500000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom'], 'available'),
        ('Tô Hiến Thành', 'THT-201', 'Shared', 4, 1800000.00, ARRAY['wifi', 'air_conditioner', 'shared_bathroom'], 'available'),
        ('Trần Não', 'TN-101', 'Single', 1, 3200000.00, ARRAY['wifi', 'air_conditioner'], 'available'),
        ('Trần Não', 'TN-202', 'Shared', 4, 1600000.00, ARRAY['wifi', 'shared_bathroom'], 'available'),
        ('Nguyễn Cửu Vân', 'NCV-101', 'Single', 1, 3800000.00, ARRAY['wifi', 'air_conditioner', 'private_bathroom'], 'available'),
        ('Nguyễn Cửu Vân', 'NCV-203', 'Shared', 4, 1900000.00, ARRAY['wifi', 'air_conditioner', 'shared_bathroom'], 'available')
) AS r(branch_name, room_number, room_type, max_capacity, price_per_month, amenities, status)
JOIN public.branches b ON b.name = r.branch_name
ON CONFLICT (branch_id, room_number) DO UPDATE
SET room_type = EXCLUDED.room_type,
    max_capacity = EXCLUDED.max_capacity,
    price_per_month = EXCLUDED.price_per_month,
    amenities = EXCLUDED.amenities,
    status = EXCLUDED.status,
    updated_at = now();

-- ============================================
-- 3. Sample Beds
-- ============================================
INSERT INTO public.beds (room_id, bed_number, price_per_month, status)
SELECT r.id, b.bed_number, b.price_per_month, b.status::public.bed_status
FROM (
    VALUES
        ('THT-101', 'A', 3500000.00, 'available'),
        ('THT-201', 'A', 1800000.00, 'available'),
        ('THT-201', 'B', 1800000.00, 'available'),
        ('THT-201', 'C', 1800000.00, 'available'),
        ('THT-201', 'D', 1800000.00, 'available'),
        ('TN-101', 'A', 3200000.00, 'available'),
        ('TN-202', 'A', 1600000.00, 'available'),
        ('TN-202', 'B', 1600000.00, 'available'),
        ('TN-202', 'C', 1600000.00, 'available'),
        ('TN-202', 'D', 1600000.00, 'available'),
        ('NCV-101', 'A', 3800000.00, 'available'),
        ('NCV-203', 'A', 1900000.00, 'available'),
        ('NCV-203', 'B', 1900000.00, 'available'),
        ('NCV-203', 'C', 1900000.00, 'available'),
        ('NCV-203', 'D', 1900000.00, 'available')
) AS b(room_number, bed_number, price_per_month, status)
JOIN public.rooms r ON r.room_number = b.room_number
ON CONFLICT (room_id, bed_number) DO UPDATE
SET price_per_month = EXCLUDED.price_per_month,
    status = EXCLUDED.status,
    updated_at = now();

-- ============================================
-- 4. Services
-- ============================================
INSERT INTO public.services (name, description, price, active)
VALUES
    ('Electricity', 'Monthly electricity usage fee', 4000.00, true),
    ('Water', 'Monthly water usage fee', 100000.00, true),
    ('Parking', 'Motorbike parking fee', 150000.00, true),
    ('Cleaning', 'Shared area cleaning fee', 100000.00, true)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    price = EXCLUDED.price,
    active = EXCLUDED.active,
    updated_at = now();

-- ============================================
-- Verification query
-- ============================================
-- SELECT name, address FROM public.branches ORDER BY name;
-- SELECT room_number, room_type, status FROM public.rooms ORDER BY room_number;
