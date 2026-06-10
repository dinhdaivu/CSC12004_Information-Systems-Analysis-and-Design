/**
 * Low-VU scheduler N+1 isolation test.
 *
 * Uses 5 VUs so the connection pool is NOT saturated by HTTP load alone.
 * At 5 VUs × 3 DB endpoints = 15 concurrent queries → pool-5 handles this
 * without queuing. The per-minute p99 baseline (idle ticks) should be fast
 * (~50–200ms), making the scheduler's spike unmistakably visible.
 *
 * Compare against scheduler-impact.js (20 VUs) to see the pool-saturation
 * baseline effect.
 *
 * SEED:  psql $DB_URL -f tests/load/seed-scheduler-n50-reset.sql
 * RUN:
 *   k6 run tests/load/scheduler-impact-5vu.js \
 *     -e SPRING_URL=http://localhost:8080      \
 *     -e TEST_EMAIL=you@example.com            \
 *     -e TEST_PASSWORD=secret
 */

import http   from 'k6/http';
import { sleep, check, fail } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const SPRING_URL    = __ENV.SPRING_URL    || 'http://localhost:8080';
const TEST_EMAIL    = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

const VU_COUNT   = 5;
const DURATION_S = 240;

export const options = {
  vus:      VU_COUNT,
  duration: `${DURATION_S}s`,
  summaryTrendStats: ['avg', 'p(50)', 'p(95)', 'p(99)', 'max'],
  thresholds: {
    'spring_errors': ['rate<0.01'],
  },
};

const springRooms   = new Trend('spring_rooms',   true);
const springRentals = new Trend('spring_rentals', true);
const springHealth  = new Trend('spring_health',  true);
const springErrors  = new Rate('spring_errors');
const poolTimeouts  = new Counter('spring_pool_timeout_5xx');

const bucketRooms = [
  new Trend('minute_0_rooms', true),
  new Trend('minute_1_rooms', true),
  new Trend('minute_2_rooms', true),
  new Trend('minute_3_rooms', true),
];
const bucketRentals = [
  new Trend('minute_0_rentals', true),
  new Trend('minute_1_rentals', true),
  new Trend('minute_2_rentals', true),
  new Trend('minute_3_rentals', true),
];

export function setup() {
  if (!TEST_EMAIL || !TEST_PASSWORD) fail('Set TEST_EMAIL and TEST_PASSWORD');

  const res = http.post(
    `${SPRING_URL}/api/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  if (res.status !== 200) fail(`Login failed (${res.status}): ${res.body}`);
  const token = res.json('data.token');
  if (!token) fail('Login response missing data.token');

  return { token, startTime: Date.now() };
}

export default function (data) {
  const auth    = { headers: { Authorization: `Bearer ${data.token}` } };
  const elapsed = (Date.now() - data.startTime) / 1000;
  const bucket  = Math.min(Math.floor(elapsed / 60), 3);

  // Sequential requests — one DB connection at a time per VU.
  // 5 VUs × 1 request at a time = ~1-2 pool slots used during idle ticks,
  // leaving 3-4 slots free for the scheduler's burst. http.batch() was wrong
  // here: 5 VUs × 2 concurrent DB requests = 10 always queuing on pool-5.

  const rooms = http.get(`${SPRING_URL}/api/rooms`, auth);
  springRooms.add(rooms.timings.duration);
  bucketRooms[bucket].add(rooms.timings.duration);
  springErrors.add(rooms.status >= 500);
  if (rooms.status >= 500) poolTimeouts.add(1);

  sleep(0.5);

  const rentals = http.get(`${SPRING_URL}/api/rental-requests`, auth);
  springRentals.add(rentals.timings.duration);
  bucketRentals[bucket].add(rentals.timings.duration);
  springErrors.add(rentals.status >= 500);
  if (rentals.status >= 500) poolTimeouts.add(1);

  const health = http.get(`${SPRING_URL}/api/health`);
  springHealth.add(health.timings.duration);
  check(health, { 'health OK': r => r.status === 200 });

  // Long sleep keeps pool utilisation near zero between iterations.
  // Iteration cadence: ~50–200ms rooms + 500ms sleep + ~50–200ms rentals + 3s sleep ≈ 4s
  // Pool pressure from 5 VUs: ~5 × (200ms / 4000ms) ≈ 0.25 connections on average.
  sleep(3);
}

export function handleSummary(data) {
  const m   = data.metrics;
  const p   = (key, pct) => (m[key]?.values?.[`p(${pct})`] ?? 0).toFixed(0);
  const avg = (key)      => (m[key]?.values?.avg            ?? 0).toFixed(0);

  const bucketRow = (min, rKey, lKey) =>
    `  min${min} (${String(min*60).padStart(3)}–${String(min*60+60).padStart(3)}s)` +
    `  rooms p99=${p(rKey,99).padStart(5)}ms  rentals p99=${p(lKey,99).padStart(5)}ms`;

  const idle = Math.min(
    m['minute_1_rentals']?.values?.['p(99)'] ?? 9999,
    m['minute_2_rentals']?.values?.['p(99)'] ?? 9999,
    m['minute_3_rentals']?.values?.['p(99)'] ?? 9999,
  );
  const spike = m['minute_0_rentals']?.values?.['p(99)'] ?? 0;
  const multiplier = idle > 0 ? (spike / idle).toFixed(1) : '?';

  const errors   = ((m['spring_errors']?.values?.rate ?? 0) * 100).toFixed(2);
  const requests =   m['http_reqs']?.values?.count ?? 0;

  return { stdout: `
╔══════════════════════════════════════════════════════════════════════════════╗
║  Scheduler N+1 — 5-VU isolation test (pool NOT saturated by VU load)       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  VUs: 5     Duration: 4m  Pool: 5 connections  N=50 per tick               ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  OVERALL                                                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
  /api/rooms           avg=${avg('spring_rooms').padStart(5)}ms  p99=${p('spring_rooms',99).padStart(5)}ms
  /api/rental-requests avg=${avg('spring_rentals').padStart(5)}ms  p99=${p('spring_rentals',99).padStart(5)}ms
  /api/health          avg=${avg('spring_health').padStart(5)}ms  p99=${p('spring_health',99).padStart(5)}ms
╠══════════════════════════════════════════════════════════════════════════════╣
║  PER-MINUTE BUCKETS                                                         ║
╠══════════════════════════════════════════════════════════════════════════════╣
${bucketRow(0, 'minute_0_rooms', 'minute_0_rentals')}   ← scheduler tick (N=50)
${bucketRow(1, 'minute_1_rooms', 'minute_1_rentals')}   ← idle
${bucketRow(2, 'minute_2_rooms', 'minute_2_rentals')}   ← idle
${bucketRow(3, 'minute_3_rooms', 'minute_3_rentals')}   ← idle
╠══════════════════════════════════════════════════════════════════════════════╣
  Scheduler spike / idle ratio : ${multiplier}×  (rentals p99: ${spike.toFixed(0)}ms vs ${idle.toFixed(0)}ms)
  Total requests : ${requests}
  Error rate     : ${errors}%
╠══════════════════════════════════════════════════════════════════════════════╣
  After batch-load fix: ratio should be ≤ 1.5×
╚══════════════════════════════════════════════════════════════════════════════╝
` };
}
