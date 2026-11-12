import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { CrashScreen } from './CrashScreen';
import { ErrorBoundary } from './ErrorBoundary';

/** Keyed by pathname, so navigating away from a crashed page resets the boundary. */
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <ErrorBoundary key={pathname} fallback={<CrashScreen />}>
      {children}
    </ErrorBoundary>
  );
}
