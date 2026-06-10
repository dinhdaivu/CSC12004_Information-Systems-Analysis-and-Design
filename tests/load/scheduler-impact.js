/**
 * Scheduler N+1 impact test — measures real DB latency degradation.
 *
 * HOW IT WORKS
 * ─────────────
 * PendingRentalRequestScheduler fires every 60 s and, at N=50, holds the
 * HikariCP connection pool (size=5) for ~1 800 ms while executing 300 serial
 * queries. During that window every concurrent HTTP request queues for a free
 * connection → visible as a p99 spike in k6 trends.
 *
 * PREREQS — seed N=50 REQUESTED rental requests before running:
 *
 *   psql $DB_URL -f tests/load/seed-scheduler-n50.sql
 *
 * RUN
 * ────
 *   k6 run tests/load/scheduler-impact.js \
 *     -e SPRING_URL=http://localhost:8080   \
 *     -e TEST_EMAIL=admin@example.com       \
 *     -e TEST_PASSWORD=secret
 *
 * WHAT TO LOOK FOR
 * ─────────────────
 * - `spring_rooms_p99` and `spring_deposits_p99` will spike every ~60 s
 * - `spring_pool_wait_p99` (if actuator metrics enabled) shows queue time
 * - Compare `baseline_p99` (first 60 s) vs `peak_p99` (scheduler windows)
 * - After the batch-load fix those spikes should flatten to near-baseline
 */

import http    from 'k6/http';
import { sleep, group, check, fail } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

// ── Config ────────────────────────────────────────────────────────────────────

const SPRING_URL    = __ENV.SPRING_URL    || 'http://localhost:8080';
const TEST_EMAIL    = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

// How many concurrent users hammer the DB while the scheduler fires.
// Keep it low (10–20) so the pool-exhaustion effect is clearly visible.
const VU_COUNT = 20;

// Total duration: 4 minutes covers ~4 scheduler ticks (every 60 s).
export const options = {
  vus:      VU_COUNT,
  duration: '4m',
  summaryTrendStats: ['avg', 'p(50)', 'p(90)', 'p(95)', 'p(99)', 'max'],
  thresholds: {
    // Fail the test if error rate exceeds 5% — pool exhaustion causes 5xx
    'spring_errors': ['rate<0.05'],
  },
};

// ── Metrics ───────────────────────────────────────────────────────────────────

// Endpoints that READ from tables the scheduler also reads (rooms, users, deposits)
const springRooms    = new Trend('spring_rooms',    true);
const springDeposits = new Trend('spring_deposits', true);
const springUsers    = new Trend('spring_users',    true);
const springRentals  = new Trend('spring_rentals',  true);
const springHealth   = new Trend('spring_health',   true);

const springErrors   = new Rate('spring_errors');
const poolTimeouts   = new Counter('spring_pool_timeout_5xx');

// ── Auth ──────────────────────────────────────────────────────────────────────

export function setup() {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    fail('Set TEST_EMAIL and TEST_PASSWORD env vars.\n' +
         'Also ensure 50 REQUESTED rental requests are seeded:\n' +
         '  psql $DB_URL -f tests/load/seed-scheduler-n50.sql');
  }

  const res = http.post(
    `${SPRING_URL}/api/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  if (res.status !== 200) {
    fail(`Login failed (${res.status}): ${res.body}`);
  }

  const token = res.json('data.token');
  if (!token) fail('Login response missing data.token');

  console.log(`Authenticated. Spring: ${SPRING_URL}`);
  console.log('Watch for p99 spikes every ~60 s — that is the scheduler window.');
  return { token };
}

// ── Main VU loop ──────────────────────────────────────────────────────────────

export default function (data) {
  const auth = { headers: { Authorization: `Bearer ${data.token}` } };

  // These endpoints all compete with the scheduler for the same DB connections.
  group('scheduler-competing reads', () => {
    const [rooms, deposits, users, rentals, health] = http.batch([
      { method: 'GET', url: `${SPRING_URL}/api/rooms`,           params: auth  },
      { method: 'GET', url: `${SPRING_URL}/api/deposits`,        params: auth  },
      { method: 'GET', url: `${SPRING_URL}/api/users`,           params: auth  },
      { method: 'GET', url: `${SPRING_URL}/api/rental-requests`, params: auth  },
      { method: 'GET', url: `${SPRING_URL}/api/health`                         },
    ]);

    springRooms.add(rooms.timings.duration);
    springDeposits.add(deposits.timings.duration);
    springUsers.add(users.timings.duration);
    springRentals.add(rentals.timings.duration);
    springHealth.add(health.timings.duration);

    // 503 / 504 from HikariCP connection timeout
    [rooms, deposits, users, rentals].forEach(r => {
      const isError = r.status >= 500;
      springErrors.add(isError);
      if (isError) poolTimeouts.add(1);
    });

    check(health, { 'health OK': r => r.status === 200 });
  });

  sleep(1);
}

// ── Summary ───────────────────────────────────────────────────────────────────

export function handleSummary(data) {
  const m   = data.metrics;
  const p   = (key, pct) => (m[key]?.values?.[`p(${pct})`] ?? 0).toFixed(0);
  const mx  = (key)      => (m[key]?.values?.max            ?? 0).toFixed(0);
  const avg = (key)      => (m[key]?.values?.avg            ?? 0).toFixed(0);

  const row = (label, key) =>
    `  ${label.padEnd(22)} avg=${avg(key).padStart(5)}ms  ` +
    `p50=${p(key,50).padStart(5)}ms  p95=${p(key,95).padStart(5)}ms  ` +
    `p99=${p(key,99).padStart(5)}ms  max=${mx(key).padStart(6)}ms`;

  const errors    = ((m['spring_errors']?.values?.rate  ?? 0) * 100).toFixed(2);
  const timeouts  =   m['spring_pool_timeout_5xx']?.values?.count ?? 0;
  const requests  =   m['http_reqs']?.values?.count ?? 0;

  const summary = `
╔══════════════════════════════════════════════════════════════════════════════╗
║  Scheduler Impact Test — Spring Boot @ ${SPRING_URL.padEnd(37)}║
╠══════════════════════════════════════════════════════════════════════════════╣
║  VUs: ${String(VU_COUNT).padEnd(4)}  Duration: 4m  Scheduler tick: every 60 s (N=50)        ║
╠══════════════════════════════════════════════════════════════════════════════╣
${row('/api/rooms',           'spring_rooms')}
${row('/api/deposits',        'spring_deposits')}
${row('/api/users',           'spring_users')}
${row('/api/rental-requests', 'spring_rentals')}
${row('/api/health',          'spring_health')}
╠══════════════════════════════════════════════════════════════════════════════╣
  Total requests      : ${requests}
  5xx errors          : ${timeouts}  (pool-timeout / connection exhaustion)
  Error rate          : ${errors}%
╠══════════════════════════════════════════════════════════════════════════════╣
  Interpretation:
  • p99 spikes on rooms/deposits/rentals every ~60 s = scheduler holding pool
  • max latency >> p95 = individual requests queued behind scheduler batch
  • After batch-load fix: p99 should stay flat (< 2× p50) across the full run
╚══════════════════════════════════════════════════════════════════════════════╝
`;

  return { stdout: summary };
}
