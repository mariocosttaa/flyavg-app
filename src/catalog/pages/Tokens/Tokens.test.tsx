import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { loadCatalogNamespace } from '@/catalog/i18n';
import { accessibilityViolations } from '@/test/axe';
import Tokens from '.';

// Token catalog: live airline and light/dark switching on <html>, translated, accessible.
describe('Tokens catalog page', () => {
  // The catalog namespace is loaded by the entry at boot; tests load the pt bundle once.
  beforeAll(loadCatalogNamespace);

  beforeEach(() => {
    document.documentElement.dataset.theme = 'light';
    delete document.documentElement.dataset.airline;
  });

  it('starts from the applied theme and switches airline and mode on <html>', async () => {
    const user = userEvent.setup();

    render(<Tokens />);

    expect(screen.getByRole('radio', { name: 'Grupo' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Claro' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'TAAG Virtual' }));
    await user.click(screen.getByRole('radio', { name: 'Escuro' }));

    expect(document.documentElement.dataset.airline).toBe('taag');
    expect(document.documentElement.dataset.theme).toBe('dark');

    await user.click(screen.getByRole('radio', { name: 'Grupo' }));

    expect(document.documentElement.dataset.airline).toBeUndefined();
  });

  it('shows the resolved values of the chosen theme', async () => {
    const user = userEvent.setup();

    render(<Tokens />);
    // Areia is the group light surface; TAAG Virtual dark uses its warm brown.
    expect(screen.getAllByText('#faf6ee').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('radio', { name: 'TAAG Virtual' }));
    await user.click(screen.getByRole('radio', { name: 'Escuro' }));

    expect(screen.getAllByText('#1e1919').length).toBeGreaterThan(0);
  });

  it('lists every contrast pair as passing', () => {
    render(<Tokens />);

    expect(screen.queryByText('Não cumpre')).not.toBeInTheDocument();
    expect(screen.getAllByText('Cumpre').length).toBeGreaterThan(10);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Tokens />);

    expect(await accessibilityViolations(container)).toEqual([]);
  });
});
