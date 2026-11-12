import { afterEach, describe, expect, it, vi } from 'vitest';

const init = vi.fn();

vi.mock('@sentry/react', () => ({ init }));

async function loadWithDsn(dsn: string | undefined) {
  vi.resetModules();
  vi.doMock('@/shared/lib/env', () => ({
    env: { VITE_APP_ENV: 'staging', VITE_SENTRY_DSN: dsn },
  }));

  return import('./sentry');
}

// Sentry starts only when VITE_SENTRY_DSN is set.
describe('initErrorTracking', () => {
  afterEach(() => {
    vi.doUnmock('@/shared/lib/env');
    init.mockReset();
  });

  it('does nothing without a DSN', async () => {
    const { initErrorTracking } = await loadWithDsn(undefined);

    await initErrorTracking();

    expect(init).not.toHaveBeenCalled();
  });

  it('initialises Sentry with the DSN and the app environment', async () => {
    // Placeholder DSN: never sent anywhere, the SDK is mocked.
    const { initErrorTracking } = await loadWithDsn('https://key@o0.ingest.sentry.io/0');

    await initErrorTracking();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://key@o0.ingest.sentry.io/0',
        environment: 'staging',
      }),
    );
  });
});
