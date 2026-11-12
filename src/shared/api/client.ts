import createClient from 'openapi-fetch';
import { env } from '@/shared/lib/env';
import { ApiError, NETWORK_ERROR_CODE } from './errors';
import type { paths } from './generated/schema';

// Looks up globalThis.fetch on every call: openapi-fetch keeps the function it was given, and
// MSW in tests (and the session's auth fetch later) replace the global after this module loads.
async function fetchFromApi(request: Request): Promise<Response> {
  try {
    return await globalThis.fetch(request);
  } catch (error) {
    // A cancelled query is not a network failure: let TanStack Query see the abort.
    if (request.signal.aborted) {
      throw error;
    }

    throw new ApiError(0, NETWORK_ERROR_CODE);
  }
}

export const api = createClient<paths>({ baseUrl: env.VITE_API_URL, fetch: fetchFromApi });
