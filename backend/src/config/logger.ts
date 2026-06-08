import winston from 'winston';

const isTest = process.env.NODE_ENV === 'test';

// JSON format is required for dd-trace's logInjection to embed
// dd.trace_id / dd.span_id so Datadog can correlate logs with APM spans.
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: prodFormat, // always JSON — required for dd-trace log injection
  transports: [
    new winston.transports.Console({ silent: isTest }),
  ],
});

// Pipe morgan HTTP log lines through winston so they carry trace context.
export const morganStream = {
  write: (message: string) => logger.http(message.trimEnd()),
};
