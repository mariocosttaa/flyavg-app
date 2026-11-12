import { screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ADMIN_ACCESS_PERMISSION } from '@/shared/auth';
import { navigateToDocument } from '@/shared/lib/document-navigation';
import { makeSession } from '@/test/factories/session';
import { renderWithProviders } from '@/test/render';
import { ADMIN_AUTH_CONFIG } from './auth-config';
import { loadAdminNamespace } from './i18n';
import { BASENAME } from './paths';
import { AdminRoutes } from './routes';

// Admin route tree under /admin: login through the portal, the admin gate, dashboard, catch-all.

// Full page loads cannot run in jsdom; the tests assert where the app asked to go.
vi.mock('@/shared/lib/document-navigation', () => ({ navigateToDocument: vi.fn() }));

const ADMIN_SESSION = makeSession([
  { permission: ADMIN_ACCESS_PERMISSION, scope: { type: 'group' } },
]);

const renderAdmin = (route: string, session?: ReturnType<typeof makeSession>) =>
  renderWithProviders(<AdminRoutes />, {
    route,
    basename: BASENAME,
    auth: ADMIN_AUTH_CONFIG,
    session,
  });

describe('AdminRoutes', () => {
  // main.tsx loads the admin namespace before the first render; mirror that here.
  beforeAll(() => loadAdminNamespace());

  afterEach(() => {
    vi.mocked(navigateToDocument).mockClear();
  });

  it('sends a guest to the portal login with the admin path in ?redirect=', () => {
    renderAdmin('/admin/pilots?page=2');

    expect(navigateToDocument).toHaveBeenCalledWith(
      '/login?redirect=/admin/pilots%3Fpage%3D2',
      'push',
    );
  });

  it('shows Forbidden to a pilot without admin access, outside the admin frame', () => {
    renderAdmin('/admin/', makeSession());

    expect(screen.getByRole('heading', { name: 'Acesso negado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar ao portal' })).toHaveAttribute('href', '/');
    expect(screen.queryByText('FlyAVG Admin')).not.toBeInTheDocument();
  });

  it('renders the dashboard inside the admin frame', async () => {
    renderAdmin('/admin/', ADMIN_SESSION);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Painel de administração' }),
    ).toBeInTheDocument();
    expect(screen.getByText('FlyAVG Admin')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Idioma' })).toBeInTheDocument();
  });

  it('renders NotFound for unknown admin paths', async () => {
    renderAdmin('/admin/pilots/unknown', ADMIN_SESSION);

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
  });
});
