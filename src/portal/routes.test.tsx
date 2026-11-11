import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test/render';
import { PortalRoutes } from './routes';

// Portal route tree: lazy home with its namespace, and the catch-all.
describe('PortalRoutes', () => {
  it('renders the home page with its translated status', async () => {
    renderWithProviders(<PortalRoutes />, { route: '/' });
    expect(await screen.findByRole('heading', { level: 1, name: 'FlyAVG' })).toBeInTheDocument();
    expect(screen.getByText('Em construção')).toBeInTheDocument();
  });

  it('renders NotFound for unknown paths, with a link home', async () => {
    renderWithProviders(<PortalRoutes />, { route: '/does-not-exist' });
    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/');
  });
});
