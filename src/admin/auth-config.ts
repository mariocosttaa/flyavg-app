import type { AuthConfig } from '@/shared/auth';
import { BASENAME, PATHS, PORTAL_LOGIN_PATH } from './paths';

export const ADMIN_AUTH_CONFIG: AuthConfig = {
  basename: BASENAME,
  homePath: PATHS.dashboard,
  loginPath: PORTAL_LOGIN_PATH,
  hasLoginRoute: false,
  isOtherEntryPath: (path) => path !== BASENAME && !path.startsWith(`${BASENAME}/`),
};
