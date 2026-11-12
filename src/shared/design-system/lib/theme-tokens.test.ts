import { describe, expect, it } from 'vitest';
import type { Airline } from '../theme';
import { contrastRatio, CONTRAST_REQUIREMENTS } from './contrast';
import {
  airlineRules,
  APPEARANCES,
  baseRules,
  declaredTokens,
  resolveToken,
  type Appearance,
} from './theme-tokens';

// Every airline × light/dark combination, read from the shipped CSS: WCAG AA for each token
// pair, complete base themes, and airline dark blocks that cover their light overrides.

const label = ({ airline, theme }: Appearance) => `${airline ?? 'group'} ${theme}`;

describe('theme tokens', () => {
  describe.each(APPEARANCES.map((appearance) => [label(appearance), appearance] as const))(
    '%s',
    (_name, appearance) => {
      const tokens = declaredTokens(appearance);

      it.each(
        CONTRAST_REQUIREMENTS.map((requirement) => [
          requirement.foreground,
          requirement.background,
          requirement.minimum,
        ]),
      )('%s on %s reaches %s:1', (foreground, background, minimum) => {
        const ratio = contrastRatio(
          resolveToken(tokens, foreground),
          resolveToken(tokens, background),
        );

        expect(ratio).toBeGreaterThanOrEqual(minimum);
      });
    },
  );

  it('defines the same semantic tokens in the base light and dark themes', () => {
    const { light, dark } = baseRules();

    expect(light).toBeDefined();
    expect([...(dark?.declarations.keys() ?? [])].sort()).toEqual(
      [...(light?.declarations.keys() ?? [])].sort(),
    );
  });

  it.each<Airline>(['taag', 'world'])(
    'redefines in dark every token %s overrides in light',
    (airline) => {
      // Light and dark airline blocks outrank base dark only by order: a gap leaks light values.
      const { light, dark } = airlineRules(airline);
      const lightTokens = [...(light?.declarations.keys() ?? [])];
      const darkTokens = new Set(dark?.declarations.keys());

      expect(lightTokens.length).toBeGreaterThan(0);
      expect(lightTokens.filter((token) => !darkTokens.has(token))).toEqual([]);
    },
  );

  it('lets airline overrides win over the base theme', () => {
    const groupDark = declaredTokens({ airline: null, theme: 'dark' });
    const taagDark = declaredTokens({ airline: 'taag', theme: 'dark' });

    expect(resolveToken(groupDark, '--accent')).toBe('#f2a93b');
    expect(resolveToken(taagDark, '--accent')).toBe('#e10600');
    expect(resolveToken(taagDark, '--typeface-display')).toContain('Kufam');
  });

  it('reports a missing token instead of passing silently', () => {
    expect(() => resolveToken(new Map(), '--surface')).toThrow(/not defined/);
    expect(() =>
      resolveToken(
        new Map([
          ['--first', 'var(--second)'],
          ['--second', 'var(--first)'],
        ]),
        '--first',
      ),
    ).toThrow(/Circular/);
  });
});
