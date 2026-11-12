import { createContext, use } from 'react';

/** Per-entry paths the shared guards need; each entry sets its own in main.tsx. */
export interface AuthConfig {
  /** Router basename of the entry: '' for the portal, '/admin' for admin. */
  basename: string;
  /** Where a signed-in user lands without a valid ?redirect=, as a path inside the entry. */
  homePath: string;
  /** Document path of the portal login page. Admin has none of its own. */
  loginPath: string;
  /** True when the login page is a route of this entry, so the router can open it. */
  hasLoginRoute: boolean;
  /** Document paths served by the other HTML entry, reached with a full page load. */
  isOtherEntryPath: (path: string) => boolean;
}

export const AuthConfigContext = createContext<AuthConfig | null>(null);

export function useAuthConfig(): AuthConfig {
  const value = use(AuthConfigContext);

  if (!value) {
    throw new Error('useAuthConfig must be used inside AuthConfigContext');
  }

  return value;
}

/**
 * Login URL that brings the user back to `returnPath` (a path inside the entry) afterwards.
 * Slashes stay readable (`/login?redirect=/admin/pilots`); everything else is encoded.
 */
export function buildLoginUrl(config: AuthConfig, returnPath: string): string {
  const redirect = encodeURIComponent(config.basename + returnPath).replaceAll('%2F', '/');

  return `${config.loginPath}?redirect=${redirect}`;
}
