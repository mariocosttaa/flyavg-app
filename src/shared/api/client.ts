import { env } from '@/shared/lib/env';
import { toApiError } from './errors';

// TODO(AVG-7): replace with openapi-fetch over types generated from the flyavg-api OpenAPI
// document (src/shared/api/generated), wrapped in TanStack Query hooks per domain.
export async function apiFetch<T>(path: `/${string}`, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { Accept: 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  return (await response.json()) as T;
}
