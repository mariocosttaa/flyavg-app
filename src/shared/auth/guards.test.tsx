import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { navigateToDocument } from '@/shared/lib/document-navigation';
import { makeSession } from '@/test/factories/session';
import { renderWithProviders } from '@/test/render';
import type { AuthConfig } from './auth-config';
import { AdminRoute } from './AdminRoute';
import { GuestRoute } from './GuestRoute';
import { PermissionRoute } from './PermissionRoute';
import { ADMIN_ACCESS_PERMISSION } from './permissions';
import { PrivateRoute } from './PrivateRoute';

// Guards against the stub session: guest, loading and signed-in states, redirects with a
// safe ?redirect=, permission checks in place, and the admin login through the portal.

// Full page loads cannot run in jsdom; the tests assert where the app asked to go.
vi.mock('@/shared/lib/document-navigation', () => ({ navigateToDocument: vi.fn() }));

const ADMIN_CONFIG: AuthConfig = {
  basename: '/admin',
  homePath: '/',
  loginPath: '/login',
  hasLoginRoute: false,
  isOtherEntryPath: (path) => path !== '/admin' && !path.startsWith('/admin/'),
};

function TestRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="login" element={<p>Login page</p>} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="home" element={<p>Home page</p>} />
        <Route path="flights" element={<p>Flights page</p>} />
        <Route element={<PermissionRoute permission="pilots.manage" />}>
          <Route path="pilots" element={<p>Pilots page</p>} />
        </Route>
        <Route
          element={
            <PermissionRoute
              permission="routes.manage"
              scope={{ type: 'airline', airlineId: 'airline-a' }}
            />
          }
        >
          <Route path="routes" element={<p>Routes page</p>} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="admin-area" element={<p>Admin area</p>} />
        </Route>
      </Route>
    </Routes>
  );
}

afterEach(() => {
  vi.mocked(navigateToDocument).mockClear();
});

describe('PrivateRoute', () => {
  it('sends a guest to the login with the path and query in ?redirect=', () => {
    const { currentLocation } = renderWithProviders(<TestRoutes />, {
      route: '/flights?page=2&search=fnc',
    });

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(currentLocation()).toBe('/login?redirect=/flights%3Fpage%3D2%26search%3Dfnc');
  });

  it('keeps the hash in ?redirect=', () => {
    const { currentLocation } = renderWithProviders(<TestRoutes />, {
      route: '/flights?page=2#results',
    });

    expect(currentLocation()).toBe('/login?redirect=/flights%3Fpage%3D2%23results');
  });

  it('shows the loading screen while the session is unknown', () => {
    renderWithProviders(<TestRoutes />, { route: '/flights', session: { status: 'loading' } });

    expect(screen.getByRole('status', { name: 'A carregar' })).toBeInTheDocument();
    expect(screen.queryByText('Flights page')).not.toBeInTheDocument();
  });

  it('renders the page for a signed-in user', () => {
    renderWithProviders(<TestRoutes />, { route: '/flights', session: makeSession() });

    expect(screen.getByText('Flights page')).toBeInTheDocument();
  });
});

describe('GuestRoute', () => {
  it('shows the login page to a guest', () => {
    renderWithProviders(<TestRoutes />, { route: '/login?redirect=/flights' });

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('sends a signed-in user to a safe ?redirect=', () => {
    const { currentLocation } = renderWithProviders(<TestRoutes />, {
      route: '/login?redirect=%2Fflights%3Fpage%3D2',
      session: makeSession(),
    });

    expect(screen.getByText('Flights page')).toBeInTheDocument();
    expect(currentLocation()).toBe('/flights?page=2');
  });

  it.each([
    ['an absolute URL', 'https://evil.example/flights'],
    ['a protocol-relative URL', '//evil.example'],
    ['a backslash URL', '/%5Cevil.example'],
    ['a tab-stripped URL', '/%09/evil.example'],
    ['a javascript: URL', 'javascript:alert(1)'],
  ])('ignores %s in ?redirect= and goes home', (_case, redirect) => {
    const { currentLocation } = renderWithProviders(<TestRoutes />, {
      route: `/login?redirect=${redirect}`,
      session: makeSession(),
    });

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(currentLocation()).toBe('/home');
    expect(navigateToDocument).not.toHaveBeenCalled();
  });

  it('loads an admin ?redirect= as a new document, replacing the login in history', () => {
    renderWithProviders(<TestRoutes />, {
      route: '/login?redirect=/admin/pilots?page=2',
      session: makeSession(),
    });

    expect(navigateToDocument).toHaveBeenCalledWith('/admin/pilots?page=2', 'replace');
  });

  it.each([
    ['a query', '/admin%3Ftab%3Dpilots', '/admin?tab=pilots'],
    ['a hash', '/admin%23pilots', '/admin#pilots'],
  ])('loads an admin ?redirect= with %s as a new document', (_case, redirect, expected) => {
    const { currentLocation } = renderWithProviders(<TestRoutes />, {
      route: `/login?redirect=${redirect}`,
      session: makeSession(),
    });

    expect(navigateToDocument).toHaveBeenCalledWith(expected, 'replace');
    // The portal router stays put instead of routing to its own NotFound.
    expect(currentLocation()).toBe(`/login?redirect=${redirect}`);
  });
});

describe('PermissionRoute', () => {
  it('renders Forbidden in place without the permission', () => {
    const { currentLocation } = renderWithProviders(<TestRoutes />, {
      route: '/pilots',
      session: makeSession(),
    });

    expect(screen.getByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/home');
    expect(currentLocation()).toBe('/pilots');
  });

  it('renders the page with the permission', () => {
    renderWithProviders(<TestRoutes />, {
      route: '/pilots',
      session: makeSession([{ permission: 'pilots.manage', scope: { type: 'group' } }]),
    });

    expect(screen.getByText('Pilots page')).toBeInTheDocument();
  });

  it('checks the scope: a grant for another airline is not enough', () => {
    renderWithProviders(<TestRoutes />, {
      route: '/routes',
      session: makeSession([
        { permission: 'routes.manage', scope: { type: 'airline', airlineId: 'airline-b' } },
      ]),
    });

    expect(screen.getByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
  });

  it('sends a guest to the login', () => {
    const { currentLocation } = renderWithProviders(
      <Routes>
        <Route path="login" element={<p>Login page</p>} />
        <Route element={<PermissionRoute permission="pilots.manage" />}>
          <Route path="pilots" element={<p>Pilots page</p>} />
        </Route>
      </Routes>,
      { route: '/pilots' },
    );

    expect(currentLocation()).toBe('/login?redirect=/pilots');
  });
});

describe('AdminRoute', () => {
  it('shows Forbidden with a full page link back to the portal', () => {
    renderWithProviders(<TestRoutes />, { route: '/admin-area', session: makeSession() });

    expect(screen.getByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar ao portal' })).toHaveAttribute('href', '/');
  });

  it('lets a user with admin access in', () => {
    renderWithProviders(<TestRoutes />, {
      route: '/admin-area',
      session: makeSession([{ permission: ADMIN_ACCESS_PERMISSION, scope: { type: 'group' } }]),
    });

    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });
});

describe('admin entry login', () => {
  it('sends a guest to the portal login with the full admin path in ?redirect=', () => {
    renderWithProviders(<TestRoutes />, {
      route: '/admin/flights?page=2',
      basename: '/admin',
      auth: ADMIN_CONFIG,
    });

    expect(navigateToDocument).toHaveBeenCalledWith(
      '/login?redirect=/admin/flights%3Fpage%3D2',
      'push',
    );
    expect(screen.getByRole('status', { name: 'A carregar' })).toBeInTheDocument();
  });
});
