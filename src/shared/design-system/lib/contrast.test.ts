import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from './contrast';

describe('contrastRatio', () => {
  it('gives 21:1 for black on white and 1:1 for a color on itself', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#0f1b2d', '#0f1b2d')).toBe(1);
  });

  it('does not depend on the order of the two colors', () => {
    expect(contrastRatio('#faf6ee', '#0f1b2d')).toBe(contrastRatio('#0f1b2d', '#faf6ee'));
  });

  it('keeps the unrounded value, so a near miss stays a miss', () => {
    // World blue on Areia: shown as 4.5 by tools that round, below AA in fact.
    const ratio = contrastRatio('#1e6fd9', '#faf6ee');

    expect(ratio).toBeLessThan(4.5);
    expect(ratio).toBeGreaterThan(4.49);
  });

  it('rejects colors it cannot measure', () => {
    expect(() => relativeLuminance('rgb(0 0 0 / 0.4)')).toThrow(/#rrggbb/);
    expect(() => relativeLuminance('#fff')).toThrow(/#rrggbb/);
  });
});
