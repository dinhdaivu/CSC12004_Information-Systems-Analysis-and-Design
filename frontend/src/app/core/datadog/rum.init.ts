import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';
import { environment } from '../../../environments/environment';

export function initDatadog(): void {
  if (!environment.datadogRumAppId || !environment.datadogRumClientToken) return;

  // Real User Monitoring — captures page loads, Angular route changes,
  // resource timings, XHR/fetch latency, Core Web Vitals, and JS errors.
  datadogRum.init({
    applicationId: environment.datadogRumAppId,
    clientToken: environment.datadogRumClientToken,
    site: environment.datadogSite,
    service: 'homestay-dorm-frontend',
    env: environment.production ? 'production' : 'development',
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,   // record 20% of sessions as replays
    trackUserInteractions: true,   // clicks, form submits
    trackResources: true,          // XHR/fetch + static assets
    trackLongTasks: true,          // JS tasks > 50 ms
    defaultPrivacyLevel: 'mask-user-input', // mask PII in replays
  });

  // Browser Logs — forwards console.error + uncaught exceptions to Datadog
  // Logs, correlated with RUM sessions via the session ID.
  datadogLogs.init({
    clientToken: environment.datadogRumClientToken,
    site: environment.datadogSite,
    service: 'homestay-dorm-frontend',
    env: environment.production ? 'production' : 'development',
    forwardErrorsToLogs: true,
    forwardConsoleLogs: ['error', 'warn'],
    sessionSampleRate: 100,
  });
}
