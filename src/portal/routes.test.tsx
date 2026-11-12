import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeSession } from '@/test/factories/session';
import { renderWithProviders } from '@/test/render';
import { PORTAL_AUTH_CONFIG } from './auth-config';
import { PortalRoutes } from './routes';

// Portal route tree: public pages, the guest-only login, the guarded pilot area, the catch-all.
const renderPortal = (route: string, session?: ReturnType<typeof makeSession>) =>
  renderWithProviders(<PortalRoutes />, { route, auth: PORTAL_AUTH_CONFIG, session });

describe('PortalRoutes', () => {
  it('renders the home page with its translated status and the public header', async () => {
    renderPortal('/');

    expect(await screen.findByRole('heading', { level: 1, name: 'FlyAVG' })).toBeInTheDocument();
    expect(screen.getByText('Em construção')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Idioma' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Iniciar sessão' })).toHaveAttribute('href', '/login');
  });

  it('sends a guest from the pilot area to the login, keeping the way back', async () => {
    const { currentLocation } = renderPortal('/pilot');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Iniciar sessão' }),
    ).toBeInTheDocument();
    expect(currentLocation()).toBe('/login?redirect=/pilot');
  });

  it('renders the pilot area inside the pilot frame for a signed-in user', async () => {
    renderPortal('/pilot', makeSession());

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Área do piloto' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Test Pilot')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page');
  });

  it('sends a signed-in user away from the login to the pilot area', async () => {
    const { currentLocation } = renderPortal('/login', makeSession());

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Área do piloto' }),
    ).toBeInTheDocument();
    expect(currentLocation()).toBe('/pilot');
  });

  it('renders NotFound for unknown paths, with a link home', async () => {
    renderPortal('/does-not-exist');

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar ao início' })).toHaveAttribute('href', '/');
  });
});
