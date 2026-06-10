-- Seed 50 REQUESTED rental requests so PendingRentalRequestScheduler
-- has N=50 items to process each 60-second tick during the k6 test.
--
-- Run once before the test:
--   psql $DB_URL -f tests/load/seed-scheduler-n50.sql
--
-- Clean up after:
--   psql $DB_URL -c "DELETE FROM public.rental_requests WHERE note = 'k6-scheduler-seed';"
--   psql $DB_URL -c "DELETE FROM public.rooms          WHERE room_number LIKE 'K6-%';"
--   psql $DB_URL -c "DELETE FROM public.users          WHERE email LIKE 'k6-%@bench.test';"
--   psql $DB_URL -c "DELETE FROM public.branches       WHERE name = 'k6-bench-branch';"

BEGIN;

-- ── 1. Branch ─────────────────────────────────────────────────────────────────
INSERT INTO public.branches (id, name, address, phone)
VALUES ('00000000-0000-0000-0000-000000000001', 'k6-bench-branch', '1 Test St', '0900000000')
ON CONFLICT (name) DO NOTHING;

-- ── 2. 50 rooms (AVAILABLE, MIXED gender) ────────────────────────────────────
INSERT INTO public.rooms (id, branch_id, room_number, room_type, max_capacity, price_per_month, status, gender_policy)
SELECT
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'K6-' || LPAD(i::text, 3, '0'),
    'SINGLE',
    2,
    3000000,
    'available',
    'mixed'
FROM generate_series(1, 50) AS i
ON CONFLICT DO NOTHING;

-- ── 3. 50 customer users ─────────────────────────────────────────────────────
-- Uses a dummy password hash (not usable for login).
INSERT INTO public.users (id, email, full_name, phone_number, gender, role, status, password_hash)
SELECT
    gen_random_uuid(),
    'k6-' || LPAD(i::text, 3, '0') || '@bench.test',
    'K6 Customer ' || i,
    '09' || LPAD(i::text, 8, '0'),
    'male',
    'customer',
    'active',
    '$2b$10$placeholder'
FROM generate_series(1, 50) AS i
ON CONFLICT (email) DO NOTHING;

-- ── 4. 50 REQUESTED rental requests (one per user + room) ────────────────────
INSERT INTO public.rental_requests (customer_id, room_id, people_count, status, note)
SELECT
    u.id,
    r.id,
    1,
    'requested',
    'k6-scheduler-seed'
FROM
    (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
       FROM public.users WHERE email LIKE 'k6-%@bench.test') u
    JOIN
    (SELECT id, ROW_NUMBER() OVER (ORDER BY room_number)     AS rn
       FROM public.rooms WHERE room_number LIKE 'K6-%')       r
    ON u.rn = r.rn;

COMMIT;

-- Verify
SELECT COUNT(*) AS seeded_requests
  FROM public.rental_requests
 WHERE note = 'k6-scheduler-seed' AND status = 'requested';
