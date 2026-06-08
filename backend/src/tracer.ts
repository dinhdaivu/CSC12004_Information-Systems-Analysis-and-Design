import tracer from 'dd-trace';

// Must be imported before any other module in index.ts.
// logInjection: true automatically injects dd.trace_id/dd.span_id into
// every winston log record so APM traces link directly to log lines.
// dbmPropagationMode: 'full' tags outbound SQL comments with trace context
// so Datadog Database Monitoring can correlate slow queries to APM spans.
//
// Required env vars:
//   DD_API_KEY, DD_SITE=ap2.datadoghq.com, DD_SERVICE, DD_ENV, DD_VERSION
if (process.env.NODE_ENV !== 'test') {
  tracer.init({
    service: process.env.DD_SERVICE ?? 'homestay-dorm-backend',
    env: process.env.DD_ENV ?? 'development',
    version: process.env.DD_VERSION ?? '1.0.0',
    logInjection: true,
    dbmPropagationMode: 'full',
  });
}

export default tracer;
