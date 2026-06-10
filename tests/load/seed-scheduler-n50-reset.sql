-- Reset k6 scheduler seed so each test run starts with 50 REQUESTED rental requests.
--
-- Run ONCE before starting the k6 test (not between ticks):
--   psql $DB_URL -f tests/load/seed-scheduler-n50-reset.sql
--
-- What this does:
--   1. Deletes any deposit_requests created by the scheduler from a prior run
--      (linked via rental_request_id to k6-scheduler-seed requests).
--   2. Deletes all k6 rental_requests (note = 'k6-scheduler-seed').
--   3. Re-inserts 50 fresh REQUESTED rental_requests (rooms + users already exist
--      from seed-scheduler-n50.sql — run that first if this is a fresh DB).
--
-- After the test, only minute_0 (0–60 s) will spike — that is expected.
-- minute_1 through minute_3 are idle windows (0 REQUESTED requests). The
-- contrast between minute_0 p99 and the idle-minute p99 is the N+1 proof.
-- To see spikes in all 4 buckets, run this script 3 more times while the test
-- is live (once per 60 s), or add pg_cron (see docs/load-test.md for details).

BEGIN;

-- ── 1. Drop deposit_requests linked to k6 rental requests ─────────────────────
DELETE FROM public.deposit_requests
WHERE rental_request_id IN (
    SELECT id FROM public.rental_requests
    WHERE note = 'k6-scheduler-seed'
);

-- ── 2. Drop k6 rental requests ────────────────────────────────────────────────
DELETE FROM public.rental_requests
WHERE note = 'k6-scheduler-seed';

-- ── 3. Re-insert 50 REQUESTED rental requests ─────────────────────────────────
-- Assumes k6-bench users + K6-* rooms already exist from seed-scheduler-n50.sql.
-- If the original seed has not been run yet, run it first:
--   psql $DB_URL -f tests/load/seed-scheduler-n50.sql
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
SELECT
    COUNT(*) FILTER (WHERE status = 'requested') AS seeded_requested,
    COUNT(*) FILTER (WHERE status != 'requested') AS remaining_processed
FROM public.rental_requests
WHERE note = 'k6-scheduler-seed';
