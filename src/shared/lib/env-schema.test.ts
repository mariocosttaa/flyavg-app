import { describe, expect, it } from 'vitest';
import { parseEnvironment as parseEnvironment } from './env-schema';

// Startup validation of the build-time VITE_* variables.
describe('parseEnvironment', () => {
  const valid = {
    VITE_API_URL: 'https://api.example.test',
    VITE_APP_ENV: 'staging',
    VITE_SITE_URL: 'https://app.example.test',
  };

  it('accepts a complete environment and treats an empty DSN as unset', () => {
    expect(parseEnvironment({ ...valid, VITE_SENTRY_DSN: '' })).toEqual({
      ...valid,
      VITE_SENTRY_DSN: undefined,
    });
  });

  it('fails with the name of the invalid variable', () => {
    expect(() => parseEnvironment({ ...valid, VITE_API_URL: 'not-a-url' })).toThrow(/VITE_API_URL/);
  });

  it('rejects an unknown app environment', () => {
    expect(() => parseEnvironment({ ...valid, VITE_APP_ENV: 'qa' })).toThrow(/VITE_APP_ENV/);
  });
});
