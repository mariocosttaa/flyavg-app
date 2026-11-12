import { env } from '@/shared/lib/env';

// Sentry is active only with a DSN. The SDK is imported on demand, so builds without a DSN do
// not download it.
export async function initErrorTracking(): Promise<void> {
  if (!env.VITE_SENTRY_DSN) {
    return;
  }

  const Sentry = await import('@sentry/react');

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_APP_ENV,
    // No personal data: no user info, cookies or request bodies.
    dataCollection: { userInfo: false, cookies: false, httpBodies: [] },
  });
}
