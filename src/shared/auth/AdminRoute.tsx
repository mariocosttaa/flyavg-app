import { Forbidden } from '@/shared/components/Forbidden';
import { PermissionRoute } from './PermissionRoute';
import { ADMIN_ACCESS_PERMISSION } from './permissions';

/** Admin entry gate: a pilot without admin access sees Forbidden with a way back to the portal. */
export function AdminRoute() {
  return (
    <PermissionRoute permission={ADMIN_ACCESS_PERMISSION} fallback={<Forbidden hasPortalExit />} />
  );
}
