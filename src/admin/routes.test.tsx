import { screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { loadAdminNamespace } from './i18n';
import { AdminRoutes } from './routes';

// Admin route tree: dashboard at the entry root and the catch-all.
describe('AdminRoutes', () => {
  // main.tsx loads the admin namespace before the first render; mirror that here.
  beforeAll(() => loadAdminNamespace());

  it('renders the dashboard inside the admin frame', async () => {
    renderWithProviders(<AdminRoutes />, { route: '/' });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Painel de administração' }),
    ).toBeInTheDocument();
    expect(screen.getByText('FlyAVG Admin')).toBeInTheDocument();
  });

  it('renders NotFound for unknown admin paths', async () => {
    renderWithProviders(<AdminRoutes />, { route: '/pilots/unknown' });
    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
  });
});
