// WCAG 2.2 contrast ratio between two opaque sRGB colors written as #rrggbb.
const HEX_COLOR = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;

export const AA_TEXT = 4.5;
export const AA_NON_TEXT = 3;

export interface ContrastRequirement {
  foreground: string;
  background: string;
  minimum: number;
}

const SURFACES = ['--surface', '--surface-raised'];
const TEXT_ON_SURFACES = [
  '--fg',
  '--fg-muted',
  '--accent-text',
  '--danger-text',
  '--success-text',
  '--warning-text',
  '--info-text',
];
const FILLS = ['--accent', '--danger', '--success', '--warning', '--info'];
// Focus indicators and input outlines must stand out from what surrounds them (WCAG 1.4.11).
const NON_TEXT_ON_SURFACES = ['--focus-ring', '--border-strong'];

/** Every token pair that must meet AA in each airline and light/dark combination. */
export const CONTRAST_REQUIREMENTS: ContrastRequirement[] = [
  ...SURFACES.flatMap((background) =>
    TEXT_ON_SURFACES.map((foreground) => ({ foreground, background, minimum: AA_TEXT })),
  ),
  ...FILLS.map((fill) => ({ foreground: `${fill}-fg`, background: fill, minimum: AA_TEXT })),
  ...SURFACES.flatMap((background) =>
    NON_TEXT_ON_SURFACES.map((foreground) => ({ foreground, background, minimum: AA_NON_TEXT })),
  ),
];

function channelLuminance(channel: number): number {
  const value = channel / 255;

  return value <= 0.040_45 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: string): number {
  const match = HEX_COLOR.exec(color);

  if (!match) {
    throw new Error(`Expected an opaque #rrggbb color, received "${color}"`);
  }

  const [red, green, blue] = match
    .slice(1)
    .map((hex) => channelLuminance(Number.parseInt(hex, 16)));

  return 0.2126 * (red ?? 0) + 0.7152 * (green ?? 0) + 0.0722 * (blue ?? 0);
}

/** Unrounded ratio: WCAG thresholds are compared without rounding (4.498 fails 4.5). */
export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (first, second) => second - first,
  );

  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}
