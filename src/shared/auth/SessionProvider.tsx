import type { ReactNode } from 'react';
import { hasPermission } from './permissions';
import { SessionContext } from './session-context';
import type { Permission, PermissionScope, SessionState } from './types';

const GUEST_SESSION: SessionState = { status: 'guest' };

interface SessionProviderProps {
  /** Fixed session state, for tests until the real session exists. */
  session?: SessionState;
  children: ReactNode;
}

/**
 * STUB until the sign-in flow exists: makes no API calls and is always a guest unless a test
 * passes `session`. TODO(AVG-23): bootstrap from the refresh cookie and /me (reference 009).
 */
export function SessionProvider({ session = GUEST_SESSION, children }: SessionProviderProps) {
  const can = (permission: Permission, scope?: PermissionScope) =>
    session.status === 'authenticated' && hasPermission(session.user, permission, scope);

  return <SessionContext value={{ ...session, can }}>{children}</SessionContext>;
}
