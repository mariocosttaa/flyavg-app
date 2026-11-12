import { Outlet } from 'react-router';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { LoginRedirect } from './LoginRedirect';
import { useSession } from './session-context';

/** Signed-in users only; guests go to the login with ?redirect= back here. */
export function PrivateRoute() {
  const { status } = useSession();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'guest') {
    return <LoginRedirect />;
  }

  return <Outlet />;
}
