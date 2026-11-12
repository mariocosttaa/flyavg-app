import { describe, expect, it } from 'vitest';
import { hasPermission } from './permissions';
import type { CurrentUser } from './types';

// Scope rules: group grants cover every airline, airline grants only their own.
const user: CurrentUser = {
  id: 'user-1',
  displayName: 'Test Pilot',
  grants: [
    { permission: 'pilots.manage', scope: { type: 'group' } },
    { permission: 'routes.manage', scope: { type: 'airline', airlineId: 'airline-a' } },
  ],
};

describe('hasPermission', () => {
  it('lets a group grant cover any airline', () => {
    expect(hasPermission(user, 'pilots.manage', { type: 'airline', airlineId: 'airline-b' })).toBe(
      true,
    );
  });

  it('limits an airline grant to that airline', () => {
    expect(hasPermission(user, 'routes.manage', { type: 'airline', airlineId: 'airline-a' })).toBe(
      true,
    );
    expect(hasPermission(user, 'routes.manage', { type: 'airline', airlineId: 'airline-b' })).toBe(
      false,
    );
  });

  it('does not let an airline grant act at group scope', () => {
    expect(hasPermission(user, 'routes.manage', { type: 'group' })).toBe(false);
  });

  it('accepts any grant when no scope is asked', () => {
    expect(hasPermission(user, 'routes.manage')).toBe(true);
  });

  it('denies a permission the user does not have', () => {
    expect(hasPermission(user, 'fleet.manage')).toBe(false);
  });
});
