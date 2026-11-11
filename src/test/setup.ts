import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { initI18n } from '@/shared/i18n/config';
import { server } from './msw/server';

// Tests render with the real pt resources, like users see them by default.
await initI18n('pt');

// Fail on any request without a handler, so missing mocks are visible.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
