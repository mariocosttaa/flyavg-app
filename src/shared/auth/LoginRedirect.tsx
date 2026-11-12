import { Navigate, useLocation } from 'react-router';
import { DocumentRedirect } from '@/shared/components/DocumentRedirect';
import { buildLoginUrl, useAuthConfig } from './auth-config';

/** Sends a guest to the portal login, remembering the current path in ?redirect=. */
export function LoginRedirect() {
  const config = useAuthConfig();
  const location = useLocation();
  const loginUrl = buildLoginUrl(config, location.pathname + location.search);

  if (config.hasLoginRoute) {
    return <Navigate to={loginUrl} replace />;
  }

  // Admin has no login page: sign-in always goes through the portal, another entry.
  return <DocumentRedirect to={loginUrl} />;
}
