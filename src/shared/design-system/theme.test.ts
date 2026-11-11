import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyInitialTheme, setAirline } from './theme';

// Boot-time theme attributes on <html>, resolved without inline scripts.
describe('theme', () => {
  // jsdom has no matchMedia; the stub reports the OS preference under test.
  const mockOsDark = (matches: boolean) =>
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches, addEventListener: vi.fn() })),
    );

  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
    delete document.documentElement.dataset.airline;
  });

  afterEach(() => vi.unstubAllGlobals());

  it('resolves the system preference to a concrete data-theme', () => {
    mockOsDark(true);
    applyInitialTheme();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('prefers the stored choice over the OS', () => {
    mockOsDark(true);
    localStorage.setItem('flyavg.theme', 'light');
    applyInitialTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('sets and clears the airline, leaving the group theme as default', () => {
    setAirline('taag');
    expect(document.documentElement.dataset.airline).toBe('taag');
    setAirline(null);
    expect(document.documentElement.dataset.airline).toBeUndefined();
  });
});
