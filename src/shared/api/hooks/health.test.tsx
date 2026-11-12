import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/msw/server';
import type { components } from '../generated/schema';
import { useHealth } from './health';

// First typed call through the generated client and TanStack Query.
const API = 'http://api.test';

type HealthResponse = components['schemas']['HealthResponseDto'];

function wrapper({ children }: { children: ReactNode }) {
  // A fresh client per test, without retries, so failures surface at once.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useHealth', () => {
  it('returns the API health with its version', async () => {
    server.use(
      http.get(`${API}/health`, () =>
        HttpResponse.json<HealthResponse>({ status: 'ok', version: '0.2.0', uptimeSeconds: 12 }),
      ),
    );

    const { result } = renderHook(() => useHealth(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ status: 'ok', version: '0.2.0', uptimeSeconds: 12 });
  });

  it('exposes the API error code', async () => {
    server.use(
      http.get(`${API}/health`, () =>
        HttpResponse.json(
          { statusCode: 500, code: 'INTERNAL_ERROR', message: 'x', requestId: 'request-1' },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(() => useHealth(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 500, code: 'INTERNAL_ERROR' });
  });
});
