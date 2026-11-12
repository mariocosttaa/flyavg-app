export type SessionStatus = 'loading' | 'guest' | 'authenticated';

/** Permission names come from the API; never invent them in the app. */
export type Permission = string;

/** A group-scoped grant covers every airline of the group. */
export type PermissionScope = { type: 'group' } | { type: 'airline'; airlineId: string };

export interface PermissionGrant {
  permission: Permission;
  scope: PermissionScope;
}

export interface CurrentUser {
  id: string;
  displayName: string;
  grants: readonly PermissionGrant[];
}

export type SessionState =
  { status: 'loading' } | { status: 'guest' } | { status: 'authenticated'; user: CurrentUser };
