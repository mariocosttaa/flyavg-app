import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/msw/server';
import { apiFetch } from './client';
import { ApiError } from './errors';

// Base fetch: prefixes the API URL and turns error payloads into ApiError by code.
const API = 'http://api.test';

describe('apiFetch', () => {
  it('returns the JSON body on success', async () => {
    server.use(http.get(`${API}/health`, () => HttpResponse.json({ status: 'ok' })));
    await expect(apiFetch<{ status: string }>('/health')).resolves.toEqual({ status: 'ok' });
  });

  it('throws an ApiError with the API code', async () => {
    // Any stable code works: the client must not depend on the message text.
    server.use(
      http.get(`${API}/health`, () =>
        HttpResponse.json({ statusCode: 503, code: 'SERVICE_UNAVAILABLE' }, { status: 503 }),
      ),
    );
    const error: unknown = await apiFetch('/health').catch((caughtError: unknown) => caughtError);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE' });
  });
});
