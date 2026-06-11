import { AwsRum, type AwsRumConfig } from "aws-rum-web";

/**
 * Initializes CloudWatch RUM client-side monitoring.
 *
 * Build-time wiring:
 *   - VITE_RUM_APP_MONITOR_ID    AppMonitor.Id (UUID, from CFN output)
 *   - VITE_RUM_IDENTITY_POOL_ID  Cognito Identity Pool (us-east-1:...)
 *   - VITE_RUM_GUEST_ROLE_ARN    The unauth role attached to the pool
 *   - VITE_RUM_REGION            us-east-1
 *
 * If any of those is missing (e.g. local dev), RUM is silently skipped.
 */
export function initRum(): AwsRum | undefined {
  const appMonitorId = import.meta.env.VITE_RUM_APP_MONITOR_ID;
  const identityPoolId = import.meta.env.VITE_RUM_IDENTITY_POOL_ID;
  const guestRoleArn = import.meta.env.VITE_RUM_GUEST_ROLE_ARN;
  const region = import.meta.env.VITE_RUM_REGION ?? "us-east-1";

  if (!appMonitorId || !identityPoolId || !guestRoleArn) {
    return undefined;
  }

  const config: AwsRumConfig = {
    sessionSampleRate: 1,
    identityPoolId,
    guestRoleArn,
    endpoint: `https://dataplane.rum.${region}.amazonaws.com`,
    // Enable HTTP plugin (XHR + fetch) AND have it inject X-Amzn-Trace-Id
    // into outbound requests so RUM segments link to backend X-Ray traces
    // in the Service Map. The default config object does not enable this.
    telemetries: [
      "errors",
      "performance",
      [
        "http",
        {
          addXRayTraceIdHeader: true,
          recordAllRequests: true,
        },
      ],
    ],
    allowCookies: true,
    enableXRay: true,
  };

  try {
    return new AwsRum(appMonitorId, "1.0.0", region, config);
  } catch (e) {
    // RUM failures must never break the app.
    // eslint-disable-next-line no-console
    console.warn("[rum] init failed", e);
    return undefined;
  }
}
