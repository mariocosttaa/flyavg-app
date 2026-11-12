import type { ReactNode } from 'react';
import { Outlet } from 'react-router';
import { Forbidden } from '@/shared/components/Forbidden';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { LoginRedirect } from './LoginRedirect';
import { useSession } from './session-context';
import type { Permission, PermissionScope } from './types';

interface PermissionRouteProps {
  permission: Permission;
  scope?: PermissionScope;
  /** Rendered in place when the permission is missing; defaults to Forbidden. */
  fallback?: ReactNode;
}

/** Renders the child routes only with the permission; never redirects a signed-in user. */
export function PermissionRoute({ permission, scope, fallback }: PermissionRouteProps) {
  const session = useSession();

  if (session.status === 'loading') {
    return <LoadingScreen />;
  }

  if (session.status === 'guest') {
    return <LoginRedirect />;
  }

  if (!session.can(permission, scope)) {
    return fallback ?? <Forbidden />;
  }

  return <Outlet />;
}
