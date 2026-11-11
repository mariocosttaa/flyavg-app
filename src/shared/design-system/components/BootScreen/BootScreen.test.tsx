import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BootScreen } from './BootScreen';

describe('BootScreen', () => {
  it('exposes a busy status with the given accessible name', () => {
    render(<BootScreen label="A carregar" />);
    const status = screen.getByRole('status', { name: 'A carregar' });

    expect(status).toHaveAttribute('aria-busy', 'true');
  });
});
