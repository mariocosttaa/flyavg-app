import type { ReactNode } from 'react';
import { AuthConfigContext, type AuthConfig } from '@/shared/auth/auth-config';
import { SessionProvider } from '@/shared/auth/SessionProvider';
import type { SessionState } from '@/shared/auth/types';

interface AppProvidersProps {
  auth: AuthConfig;
  /** Fixed session for tests while the session provider is a stub. */
  session?: SessionState;
  children: ReactNode;
}

/** Providers shared by both entries; each entry passes its own auth config. */
export function AppProviders({ auth, session, children }: AppProvidersProps) {
  return (
    <AuthConfigContext value={auth}>
      <SessionProvider session={session}>{children}</SessionProvider>
    </AuthConfigContext>
  );
}
