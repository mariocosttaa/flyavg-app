import { Navigate, Outlet, useSearchParams } from 'react-router';
import { DocumentRedirect } from '@/shared/components/DocumentRedirect';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { safeRedirect } from '@/shared/lib/safe-redirect';
import { useAuthConfig } from './auth-config';
import { useSession } from './session-context';

/** Guest-only pages (login): a signed-in user goes to ?redirect=, if it is safe, or home. */
export function GuestRoute() {
  const { status } = useSession();
  const { homePath, isOtherEntryPath } = useAuthConfig();
  const [searchParams] = useSearchParams();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'guest') {
    return <Outlet />;
  }

  const destination = safeRedirect(searchParams.get('redirect'), homePath);
  // Query and hash do not choose the entry: "/admin?tab=x" still belongs to admin.
  const { pathname } = new URL(destination, window.location.origin);

  // The router cannot open another HTML entry (admin): that needs a full page load.
  if (isOtherEntryPath(pathname)) {
    return <DocumentRedirect to={destination} shouldReplace />;
  }

  return <Navigate to={destination} replace />;
}
