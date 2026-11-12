import { render, screen, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import type { AuthConfig, SessionState } from '@/shared/auth';
import { AppProviders } from '@/shared/providers/AppProviders';
import { LocationProbe } from './LocationProbe';

// A neutral entry: the login page is a route, admin paths belong to another entry.
export const TEST_AUTH_CONFIG: AuthConfig = {
  basename: '',
  homePath: '/home',
  loginPath: '/login',
  hasLoginRoute: true,
  isOtherEntryPath: (path) => path === '/admin' || path.startsWith('/admin/'),
};

interface RenderOptions {
  route?: string;
  /** Router basename, as admin's BrowserRouter uses; `route` must start with it. */
  basename?: string;
  auth?: AuthConfig;
  session?: SessionState;
}

/** Renders inside a MemoryRouter and the app providers; i18n is initialised in setup.ts. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', basename, auth = TEST_AUTH_CONFIG, session }: RenderOptions = {},
): RenderResult & { currentLocation: () => string | null } {
  const result = render(
    <MemoryRouter initialEntries={[route]} basename={basename}>
      <AppProviders auth={auth} session={session}>
        {ui}
        <LocationProbe />
      </AppProviders>
    </MemoryRouter>,
  );

  return { ...result, currentLocation: () => screen.getByTestId('current-location').textContent };
}
