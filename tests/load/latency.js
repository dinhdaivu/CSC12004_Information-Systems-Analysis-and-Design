import http from 'k6/http';
import { sleep, group, fail } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ─── Metrics ────────────────────────────────────────────────────────────────
const t = (name) => new Trend(`endpoint_${name}_duration`, true);

const m = {
  // public
  health:              t('health'),
  branches:            t('branches'),
  rooms:               t('rooms'),
  zones:               t('zones'),
  beds:                t('beds'),
  defaultHandover:     t('default_handover_items'),
  // booking flow
  viewingAppts:        t('viewing_appointments'),
  rentalRequests:      t('rental_requests'),
  myBookings:          t('my_bookings'),
  lodgingEligibility:  t('lodging_eligibility'),
  // financial
  deposits:            t('deposits'),
  payments:            t('payments'),
  contracts:           t('contracts'),
  // post check-in
  handovers:           t('handovers'),
  disputes:            t('disputes'),
  checkoutRequests:    t('checkout_requests'),
  // admin
  users:               t('users'),
};

const errorRate = new Rate('endpoint_errors');

// ─── Options ─────────────────────────────────────────────────────────────────
export const options = {
  summaryTrendStats: ['avg', 'min', 'max', 'p(50)', 'p(95)', 'p(99)'],
  stages: [
    { duration: '30s', target: 100  },
    { duration: '1m',  target: 500  },
    { duration: '1m',  target: 1000 },
    { duration: '1m',  target: 1000 },
    { duration: '30s', target: 0    },
  ],
  thresholds: {
    'endpoint_errors': ['rate<0.10'],
  },
};

// ─── Setup (login once, share token across all VUs) ──────────────────────────
const BASE_URL      = __ENV.BASE_URL      || 'http://localhost:3000';
const TEST_EMAIL    = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

export function setup() {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    fail('Set TEST_EMAIL and TEST_PASSWORD env vars');
  }
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  if (res.status !== 200) fail(`Login failed (${res.status}): ${res.body}`);
  const token = res.json('data.token');
  if (!token) fail('Login response missing data.token');
  console.log(`Logged in as ${TEST_EMAIL}`);
  return { token };
}

// ─── Main VU function ────────────────────────────────────────────────────────
export default function (data) {
  const auth = {
    headers: {
      Authorization: `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  const hit = (metric, res, expectAdmin = false) => {
    metric.add(res.timings.duration);
    errorRate.add(res.status >= 500);
    // admin-only routes return 403 for non-admin — treat as ok
    const ok = expectAdmin ? res.status < 500 : res.status < 300;
    return ok;
  };

  group('public', () => {
    hit(m.health,          http.get(`${BASE_URL}/api/health`));
    hit(m.branches,        http.get(`${BASE_URL}/api/branches`));
    hit(m.rooms,           http.get(`${BASE_URL}/api/rooms`));
    hit(m.zones,           http.get(`${BASE_URL}/api/zones`));
    hit(m.beds,            http.get(`${BASE_URL}/api/bed`));
    hit(m.defaultHandover, http.get(`${BASE_URL}/api/default-handover-items`));
  });

  group('booking flow', () => {
    hit(m.viewingAppts,       http.get(`${BASE_URL}/api/viewing-appointments`, auth));
    hit(m.rentalRequests,     http.get(`${BASE_URL}/api/rental-requests`, auth));
    hit(m.myBookings,         http.get(`${BASE_URL}/api/my-bookings`, auth));
    hit(m.lodgingEligibility, http.get(`${BASE_URL}/api/lodging-eligibility`, auth));
  });

  group('financial', () => {
    hit(m.deposits,  http.get(`${BASE_URL}/api/deposits`, auth));
    hit(m.payments,  http.get(`${BASE_URL}/api/payments`, auth));
    hit(m.contracts, http.get(`${BASE_URL}/api/contracts`, auth));
  });

  group('post check-in', () => {
    hit(m.handovers,       http.get(`${BASE_URL}/api/handovers`, auth));
    hit(m.disputes,        http.get(`${BASE_URL}/api/disputes`, auth));
    hit(m.checkoutRequests, http.get(`${BASE_URL}/api/checkout-requests`, auth));
  });

  group('admin', () => {
    hit(m.users, http.get(`${BASE_URL}/api/users`, auth), true);
  });

  sleep(1);
}

// ─── Summary ─────────────────────────────────────────────────────────────────
export function handleSummary(data) {
  return { stdout: formatSummary(data) };
}

function formatSummary(data) {
  const metrics = data.metrics;
  const p = (key, pct) =>
    metrics[key]?.values?.[`p(${pct})`]?.toFixed(0) ?? 'N/A';
  const mx = (key) =>
    (metrics[key]?.values?.max ?? 0).toFixed(0);

  const W = 28;
  const row = (label, key) =>
    `║ ${label.padEnd(W)} ║ ${p(key,'50').padStart(7)} ║ ${p(key,'95').padStart(7)} ║ ${p(key,'99').padStart(7)} ║ ${mx(key).padStart(6)} ║`;

  const div = `╠${'═'.repeat(W+2)}╬═════════╬═════════╬═════════╬════════╣`;
  const top = `╔${'═'.repeat(W+2)}╦═════════╦═════════╦═════════╦════════╗`;
  const bot = `╚${'═'.repeat(W+2)}╩═════════╩═════════╩═════════╩════════╝`;
  const hdr = `║ ${'Endpoint'.padEnd(W)} ║   P50   ║   P95   ║   P99   ║  MAX   ║`;

  return `
${top}
║${' LATENCY SUMMARY (ms)'.padEnd(W+36)}║
${div}
${hdr}
${div}
${row('/api/health',                   'endpoint_health_duration')}
${row('/api/branches',                 'endpoint_branches_duration')}
${row('/api/rooms',                    'endpoint_rooms_duration')}
${row('/api/zones',                    'endpoint_zones_duration')}
${row('/api/bed',                      'endpoint_beds_duration')}
${row('/api/default-handover-items',   'endpoint_default_handover_items_duration')}
${div}
${row('/api/viewing-appointments',     'endpoint_viewing_appointments_duration')}
${row('/api/rental-requests',          'endpoint_rental_requests_duration')}
${row('/api/my-bookings',              'endpoint_my_bookings_duration')}
${row('/api/lodging-eligibility',      'endpoint_lodging_eligibility_duration')}
${div}
${row('/api/deposits',                 'endpoint_deposits_duration')}
${row('/api/payments',                 'endpoint_payments_duration')}
${row('/api/contracts',                'endpoint_contracts_duration')}
${div}
${row('/api/handovers',                'endpoint_handovers_duration')}
${row('/api/disputes',                 'endpoint_disputes_duration')}
${row('/api/checkout-requests',        'endpoint_checkout_requests_duration')}
${div}
${row('/api/users',                    'endpoint_users_duration')}
${bot}

  Total requests : ${data.metrics.http_reqs?.values?.count ?? 0}
  5xx error rate : ${((data.metrics.endpoint_errors?.values?.rate ?? 0) * 100).toFixed(2)}%
  Test duration  : ${Math.round((data.state?.testRunDurationMs ?? 0) / 1000)}s
`;
}
