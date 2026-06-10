import http from 'k6/http';
import { sleep, group, fail } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// ── Targets ───────────────────────────────────────────────────────────────────
// Both backends are hit on every VU iteration so latency is measured in parallel.
// Override with env vars: -e SPRING_URL=... -e EXPRESS_URL=...
const SPRING_URL  = __ENV.SPRING_URL  || 'http://localhost:8080';
const EXPRESS_URL = __ENV.EXPRESS_URL || 'http://localhost:3000';
const TEST_EMAIL    = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

// ── Metrics ───────────────────────────────────────────────────────────────────
const mk = (prefix, name) => new Trend(`${prefix}_${name}`, true);

const NAMES = [
  'health', 'branches', 'rooms', 'zones', 'beds', 'default_handover',
  'viewing_appts', 'rental_requests', 'my_bookings', 'lodging_eligibility',
  'deposits', 'payments', 'contracts',
  'handovers', 'disputes', 'checkout_requests',
  'users',
];

const s = Object.fromEntries(NAMES.map(n => [n, mk('spring', n)]));
const e = Object.fromEntries(NAMES.map(n => [n, mk('express', n)]));

const springErrors  = new Rate('spring_errors');
const expressErrors = new Rate('express_errors');

// ── Options ───────────────────────────────────────────────────────────────────
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
    'spring_errors':  ['rate<0.10'],
    'express_errors': ['rate<0.10'],
  },
};

// ── Setup — login against both backends once ──────────────────────────────────
export function setup() {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    fail('Set TEST_EMAIL and TEST_PASSWORD env vars');
  }
  const body    = JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD });
  const headers = { headers: { 'Content-Type': 'application/json' } };

  const [sr, er] = http.batch([
    ['POST', `${SPRING_URL}/api/auth/login`,  body, headers],
    ['POST', `${EXPRESS_URL}/api/auth/login`, body, headers],
  ]);

  if (sr.status !== 200) fail(`Spring login failed  (${sr.status}): ${sr.body}`);
  if (er.status !== 200) fail(`Express login failed (${er.status}): ${er.body}`);

  const springToken  = sr.json('data.token');
  const expressToken = er.json('data.token');
  if (!springToken)  fail('Spring login response missing data.token');
  if (!expressToken) fail('Express login response missing data.token');

  console.log(`Logged in — Spring: ${SPRING_URL}  Express: ${EXPRESS_URL}`);
  return { springToken, expressToken };
}

// ── Main VU function ──────────────────────────────────────────────────────────
export default function (data) {
  const sAuth = { headers: { Authorization: `Bearer ${data.springToken}`,  'Content-Type': 'application/json' } };
  const eAuth = { headers: { Authorization: `Bearer ${data.expressToken}`, 'Content-Type': 'application/json' } };

  // Hit both backends in parallel for each endpoint.
  const hit = (sm, em, path, withAuth = false) => {
    const sp = withAuth ? sAuth : {};
    const ep = withAuth ? eAuth : {};
    const [sr, er] = http.batch([
      { method: 'GET', url: SPRING_URL  + path, params: sp },
      { method: 'GET', url: EXPRESS_URL + path, params: ep },
    ]);
    sm.add(sr.timings.duration);
    em.add(er.timings.duration);
    springErrors.add(sr.status >= 500);
    expressErrors.add(er.status >= 500);
  };

  group('public', () => {
    hit(s.health,           e.health,           '/api/health');
    hit(s.branches,         e.branches,         '/api/branches');
    hit(s.rooms,            e.rooms,            '/api/rooms');
    hit(s.zones,            e.zones,            '/api/zones');
    hit(s.beds,             e.beds,             '/api/bed');
    hit(s.default_handover, e.default_handover, '/api/default-handover-items');
  });

  group('booking flow', () => {
    hit(s.viewing_appts,       e.viewing_appts,       '/api/viewing-appointments', true);
    hit(s.rental_requests,     e.rental_requests,     '/api/rental-requests',      true);
    hit(s.my_bookings,         e.my_bookings,         '/api/my-bookings',          true);
    hit(s.lodging_eligibility, e.lodging_eligibility, '/api/lodging-eligibility',  true);
  });

  group('financial', () => {
    hit(s.deposits,  e.deposits,  '/api/deposits',  true);
    hit(s.payments,  e.payments,  '/api/payments',  true);
    hit(s.contracts, e.contracts, '/api/contracts', true);
  });

  group('post check-in', () => {
    hit(s.handovers,         e.handovers,         '/api/handovers',         true);
    hit(s.disputes,          e.disputes,          '/api/disputes',          true);
    hit(s.checkout_requests, e.checkout_requests, '/api/checkout-requests', true);
  });

  group('admin', () => {
    hit(s.users, e.users, '/api/users', true);
  });

  sleep(1);
}

// ── Summary ───────────────────────────────────────────────────────────────────
export function handleSummary(data) {
  return { stdout: formatSummary(data) };
}

function formatSummary(data) {
  const m   = data.metrics;
  const p   = (key, pct) => (m[key]?.values?.[`p(${pct})`] ?? 0).toFixed(0);
  const mx  = (key)      => (m[key]?.values?.max            ?? 0).toFixed(0);
  const col = (key)      =>
    `${p(key,'50').padStart(6)} ${p(key,'95').padStart(6)} ${p(key,'99').padStart(6)} ${mx(key).padStart(6)}`;
  // col() = 6+1+6+1+6+1+6 = 27 chars  ➜  with leading+trailing space = 29

  const EW  = 30;
  const CW  = 29;
  const top = `╔${'═'.repeat(EW+2)}╦${'═'.repeat(CW)}╦${'═'.repeat(CW)}╗`;
  const sep = `╠${'═'.repeat(EW+2)}╬${'═'.repeat(CW)}╬${'═'.repeat(CW)}╣`;
  const bot = `╚${'═'.repeat(EW+2)}╩${'═'.repeat(CW)}╩${'═'.repeat(CW)}╝`;
  const lbl = `║ ${''.padEnd(EW)} ║${' Spring Boot'.padEnd(CW)}║${' Express'.padEnd(CW)}║`;
  const hdr = `║ ${'Endpoint'.padEnd(EW)} ║${' P50    P95    P99    MAX '.padEnd(CW)}║${' P50    P95    P99    MAX '.padEnd(CW)}║`;
  const row = (label, sk, ek) =>
    `║ ${label.padEnd(EW)} ║ ${col(sk)} ║ ${col(ek)} ║`;

  return `
${top}
${lbl}
${hdr}
${sep}
${row('/api/health',                 'spring_health',              'express_health')}
${row('/api/branches',               'spring_branches',            'express_branches')}
${row('/api/rooms',                  'spring_rooms',               'express_rooms')}
${row('/api/zones',                  'spring_zones',               'express_zones')}
${row('/api/bed',                    'spring_beds',                'express_beds')}
${row('/api/default-handover-items', 'spring_default_handover',    'express_default_handover')}
${sep}
${row('/api/viewing-appointments',   'spring_viewing_appts',       'express_viewing_appts')}
${row('/api/rental-requests',        'spring_rental_requests',     'express_rental_requests')}
${row('/api/my-bookings',            'spring_my_bookings',         'express_my_bookings')}
${row('/api/lodging-eligibility',    'spring_lodging_eligibility', 'express_lodging_eligibility')}
${sep}
${row('/api/deposits',               'spring_deposits',            'express_deposits')}
${row('/api/payments',               'spring_payments',            'express_payments')}
${row('/api/contracts',              'spring_contracts',           'express_contracts')}
${sep}
${row('/api/handovers',              'spring_handovers',           'express_handovers')}
${row('/api/disputes',               'spring_disputes',            'express_disputes')}
${row('/api/checkout-requests',      'spring_checkout_requests',   'express_checkout_requests')}
${sep}
${row('/api/users',                  'spring_users',               'express_users')}
${bot}

  Spring Boot error rate : ${((m['spring_errors']?.values?.rate  ?? 0) * 100).toFixed(2)}%
  Express     error rate : ${((m['express_errors']?.values?.rate ?? 0) * 100).toFixed(2)}%
  Total requests         : ${m.http_reqs?.values?.count ?? 0}
  Test duration          : ${Math.round((data.state?.testRunDurationMs ?? 0) / 1000)}s
`;
}
