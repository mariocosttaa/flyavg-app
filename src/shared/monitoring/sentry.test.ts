import { afterEach, describe, expect, it, vi } from 'vitest';
import { version } from '../../../package.json';

const init = vi.fn();
const captureException = vi.fn();

vi.mock('@sentry/react', () => ({ init, captureException }));

async function loadWithDsn(dsn: string | undefined) {
  vi.resetModules();
  vi.doMock('@/shared/lib/env', () => ({
    env: { VITE_APP_ENV: 'staging', VITE_SENTRY_DSN: dsn },
  }));

  return import('./sentry');
}

// Sentry starts only when VITE_SENTRY_DSN is set; render crashes reach it once it has loaded.
describe('error tracking', () => {
  afterEach(() => {
    vi.doUnmock('@/shared/lib/env');
    init.mockReset();
    captureException.mockReset();
  });

  it('does nothing without a DSN', async () => {
    const { initErrorTracking, reportRenderError } = await loadWithDsn(undefined);

    await initErrorTracking();
    reportRenderError(new Error('crash'), 'at Page');

    expect(init).not.toHaveBeenCalled();
    expect(captureException).not.toHaveBeenCalled();
  });

  it('initialises Sentry with the DSN, environment and app version', async () => {
    // Placeholder DSN: never sent anywhere, the SDK is mocked.
    const { initErrorTracking } = await loadWithDsn('https://key@o0.ingest.sentry.io/0');

    await initErrorTracking();

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://key@o0.ingest.sentry.io/0',
        environment: 'staging',
        release: version,
      }),
    );
  });

  it('reports a render crash with its component stack', async () => {
    const { initErrorTracking, reportRenderError } = await loadWithDsn(
      'https://key@o0.ingest.sentry.io/0',
    );
    const crash = new Error('crash');

    await initErrorTracking();
    reportRenderError(crash, 'at Page');

    expect(captureException).toHaveBeenCalledWith(crash, {
      contexts: { react: { componentStack: 'at Page' } },
    });
  });
});
