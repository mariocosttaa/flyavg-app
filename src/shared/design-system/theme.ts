const THEME_KEY = 'flyavg.theme'; // UI preference only: never put tokens or user data here

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type Airline = 'taag' | 'world';

/** What <html> shows: the airline (null = group theme) and the resolved light/dark theme. */
export interface Appearance {
  airline: Airline | null;
  theme: ResolvedTheme;
}

// Created lazily: modules must load without browser APIs (prerendering, tests).
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

export function applyInitialTheme(): void {
  applyTheme(readPreference() ?? 'system');
  // Follow OS changes while the preference is "system".
  darkQuery().addEventListener('change', () => {
    if ((readPreference() ?? 'system') === 'system') {
      applyTheme('system');
    }
  });
}

export function applyTheme(preference: ThemePreference): void {
  document.documentElement.dataset.theme = resolveTheme(preference);
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') {
    return preference;
  }

  return darkQuery().matches ? 'dark' : 'light';
}

export function setAirline(airline: Airline | null): void {
  if (airline) {
    document.documentElement.dataset.airline = airline;
  } else {
    delete document.documentElement.dataset.airline;
  }
}

function readPreference(): ThemePreference | null {
  try {
    const value = localStorage.getItem(THEME_KEY);

    return value === 'light' || value === 'dark' || value === 'system' ? value : null;
  } catch {
    // Private mode or blocked storage: fall back to the system preference.
    return null;
  }
}

/** Reads the attributes set by applyTheme and setAirline, for UI that reflects them. */
export function appliedAppearance(): Appearance {
  const { airline, theme } = document.documentElement.dataset;

  return {
    airline: airline === 'taag' || airline === 'world' ? airline : null,
    theme: theme === 'dark' ? 'dark' : 'light',
  };
}
