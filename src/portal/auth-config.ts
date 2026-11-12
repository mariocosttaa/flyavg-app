import type { AuthConfig } from '@/shared/auth';
import { PATHS } from './paths';

const ADMIN_PREFIX = '/admin';

export const PORTAL_AUTH_CONFIG: AuthConfig = {
  basename: '',
  homePath: PATHS.pilotHome,
  loginPath: PATHS.login,
  hasLoginRoute: true,
  isOtherEntryPath: (path) => path === ADMIN_PREFIX || path.startsWith(`${ADMIN_PREFIX}/`),
};
