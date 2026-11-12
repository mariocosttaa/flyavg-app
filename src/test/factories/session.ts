import type { PermissionGrant, SessionState } from '@/shared/auth';

/** Signed-in stub session; pass grants to give the user permissions. */
export function makeSession(grants: PermissionGrant[] = []): SessionState {
  return {
    status: 'authenticated',
    user: { id: 'user-1', displayName: 'Test Pilot', grants },
  };
}
