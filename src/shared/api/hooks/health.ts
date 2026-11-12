import { useQuery } from '@tanstack/react-query';
import { api } from '../client';
import { unwrap } from '../errors';
import { healthKeys } from '../query-keys';

/** Liveness of the API, with its version. */
export function useHealth() {
  return useQuery({
    queryKey: healthKeys.all,
    queryFn: async ({ signal }) => unwrap(await api.GET('/health', { signal })),
  });
}
