import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/msw/server';
import { api } from './client';
import { ApiError, unwrap } from './errors';
import type { components } from './generated/schema';

// Typed client over the generated schema: base URL, error body mapping and network failures.
const API = 'http://api.test';

type ErrorResponse = components['schemas']['ErrorResponseDto'];

describe('api client', () => {
  it('calls the API base URL and returns the typed body', async () => {
    server.use(
      http.get(`${API}/health`, () =>
        HttpResponse.json({ status: 'ok', version: '0.2.0', uptimeSeconds: 3 }),
      ),
    );

    const health = unwrap(await api.GET('/health'));

    expect(health).toEqual({ status: 'ok', version: '0.2.0', uptimeSeconds: 3 });
  });

  it('turns the standard error body into an ApiError', async () => {
    // A rate-limit answer, shaped exactly like the API's ErrorResponseDto.
    server.use(
      http.get(`${API}/health`, () =>
        HttpResponse.json<ErrorResponse>(
          {
            statusCode: 429,
            code: 'RATE_LIMITED',
            message: 'Too many requests. Try again later.',
            requestId: '0b9a3c52-4f1e-4d6a-9c3b-2f7e8d1a6b54',
          },
          { status: 429 },
        ),
      ),
    );

    const error: unknown = await api
      .GET('/health')
      .then(unwrap)
      .catch((caughtError: unknown) => caughtError);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 429,
      code: 'RATE_LIMITED',
      requestId: '0b9a3c52-4f1e-4d6a-9c3b-2f7e8d1a6b54',
    });
  });

  it('reports a failed fetch as NETWORK_ERROR', async () => {
    server.use(http.get(`${API}/health`, () => HttpResponse.error()));

    const error: unknown = await api.GET('/health').catch((caughtError: unknown) => caughtError);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
  });
});
