import type * as SentrySdk from '@sentry/react';
import { env } from '@/shared/lib/env';
import { version } from '../../../package.json';

// Set once the SDK has loaded; until then (or without a DSN) reports are dropped.
let sentry: typeof SentrySdk | undefined;

// Sentry is active only with a DSN. The SDK is imported on demand, so builds without a DSN do
// not download it.
export async function initErrorTracking(): Promise<void> {
  if (!env.VITE_SENTRY_DSN) {
    return;
  }

  const sdk = await import('@sentry/react');

  sdk.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_APP_ENV,
    release: version,
    // No personal data: no user info, cookies or request bodies.
    dataCollection: { userInfo: false, cookies: false, httpBodies: [] },
  });
  sentry = sdk;
}

/** Reports a render crash caught by an error boundary. No-op without Sentry. */
export function reportRenderError(error: Error, componentStack: string | null | undefined): void {
  sentry?.captureException(error, {
    contexts: { react: { componentStack: componentStack ?? '' } },
  });
}
