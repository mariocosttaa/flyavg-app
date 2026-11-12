import { createContext, use } from 'react';
import type { Permission, PermissionScope, SessionState } from './types';

export type SessionValue = SessionState & {
  can: (permission: Permission, scope?: PermissionScope) => boolean;
};

export const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const value = use(SessionContext);

  if (!value) {
    throw new Error('useSession must be used inside SessionProvider');
  }

  return value;
}
