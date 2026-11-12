import type { CurrentUser, Permission, PermissionGrant, PermissionScope } from './types';

// TODO(AVG-34): replace with the admin permission from the roles and permissions matrix.
export const ADMIN_ACCESS_PERMISSION: Permission = 'admin.access';

function coversScope(grant: PermissionGrant, scope: PermissionScope | undefined): boolean {
  if (!scope || grant.scope.type === 'group') {
    return true;
  }

  return scope.type === 'airline' && grant.scope.airlineId === scope.airlineId;
}

/** UX check only: the API enforces every permission. Without a scope, any grant counts. */
export function hasPermission(
  user: CurrentUser,
  permission: Permission,
  scope?: PermissionScope,
): boolean {
  return user.grants.some((grant) => grant.permission === permission && coversScope(grant, scope));
}
