# 005 - Design tokens and themes

## Purpose

Where visual values live, how airline themes and light/dark switch, and how components consume
tokens. Decided (AVG-5): everything in this file is in place in `src/shared/design-system/`;
the catalog (`/catalog/`, see 006) shows every token in every theme.

## Three layers

| Layer | File | Example | Who uses it |
|---|---|---|---|
| Primitive | `tokens/primitives.css` | `--navy-900: #0f1b2d;` `--taag-red-600: #e10600;` | Only theme files |
| Semantic | `themes/*.css` | `--surface`, `--fg`, `--accent`, `--danger-text` | Tailwind mapping, rare custom CSS |
| Utility | `index.css` `@theme inline` | `bg-surface`, `text-fg`, `p-4`, `rounded-md` | Components |

Theme-independent scales (type, tracking, leading, spacing, radii, shadows, easings, motion
durations, z-index) live in `tokens/scales.css`; `@font-face` rules in `tokens/fonts.css`.

**Raw color values (hex, rgb, hsl, oklch) appear only in `tokens/primitives.css`.** Every other
file uses semantic names. Primitives come from the brand kit (`brand-design/`); where a kit
color fails AA in a role, the primitive is a documented sRGB mix of two kit colors (the comment
says which). The only color outside the kit is the status green (`--green-700`, `--green-300`).

## Semantic tokens (Decided (AVG-5))

Every theme defines all of them, in light and dark:

| Role | Tokens | Contract |
|---|---|---|
| Surfaces | `--surface`, `--surface-raised`, `--backdrop` | Page background, cards and panels, dialog backdrop |
| Text | `--fg`, `--fg-muted` | ≥ 4.5:1 on both surfaces |
| Lines | `--border` (decorative), `--border-strong` (control outlines) | `--border-strong` ≥ 3:1 on both surfaces |
| Focus | `--focus-ring` | ≥ 3:1 on both surfaces |
| Brand accent | `--accent` (fill), `--accent-fg` (text on the fill), `--accent-text` (accent-colored text and links on surfaces) | `-fg` ≥ 4.5:1 on the fill, `-text` ≥ 4.5:1 on both surfaces |
| Status | `--danger`, `--success`, `--warning`, `--info`, each with `-fg` and `-text` | Same contract as the accent |
| Shadow | `--shadow-color` | Used by `shadow-raised` / `shadow-overlay` |
| Type | `--typeface-body`, `--typeface-display`, `--typeface-brand`, `--typeface-code` | See typography below |

Fill and text are separate roles on purpose: several brand colors cannot be text on their own
surfaces (Âmbar on Areia 1.85:1, TAAG red on its dark brown 3.5:1, World blue on Areia
4.498:1). Use `text-accent-text`, never `text-accent`, for colored text.

`src/shared/design-system/lib/theme-tokens.test.ts` reads the shipped CSS, applies the real
cascade for the 6 combinations and checks every pair above with unrounded ratios. Adding a
semantic token means adding it to the base light and dark blocks (a test compares them) and,
if it carries text, to `CONTRAST_REQUIREMENTS` in `lib/contrast.ts`.

## Theme switching

Two attributes on `<html>`:

- `data-airline`: `taag` or `world`. Decided (AVG-5): **no attribute = AVAGroup group theme**
  (landing, admin, group pages); there is no `data-airline="avagroup"` value.
- `data-theme`: `light` or `dark`, **always set** to the resolved value. When the pilot's
  preference is "system", the boot code resolves it with `matchMedia` and keeps it in sync.
  CSS therefore never needs a `prefers-color-scheme` media query.

```css
/* src/shared/design-system/themes/taag.css (excerpt) */
:root[data-airline='taag'] {
  --surface: var(--taag-gray-50);
  --accent: var(--taag-red-600);
  --accent-text: var(--taag-red-600);
  --typeface-display: var(--font-family-kufam);
}

:root[data-airline='taag'][data-theme='dark'] {
  --surface: var(--taag-brown-900);
  --accent: var(--taag-red-600);
  --accent-text: var(--taag-red-300);
  --typeface-display: var(--font-family-kufam);
}
```

`themes/base.css` defines every token for light and dark. Each airline file overrides only the
tokens that differ, and **every token set in an airline's light block is set again in its dark
block**: `:root[data-airline]` and `:root[data-theme='dark']` have the same specificity, so the
airline light block beats the base dark block by source order and would leak a light value into
dark mode. A test enforces it. Values come from the brand kits; never invent a color.

| Theme | Light | Dark |
|---|---|---|
| Group | Areia surface, white raised, Noite text, Âmbar accent (Noite on it), darkened Âmbar for accent text and focus | Noite surface, Noite + 6% Areia raised, Areia text, Âmbar accent, text and focus |
| TAAG Virtual | `#f4f6f8` surface, `#1e1919` text, red `#e10600` accent, text and focus | `#1e1919` surface, red fill, lighter red for accent text and focus |
| World Virtual | Group neutrals, `#0b2a5b` text, `#1e6fd9` fill, slightly darker blue for text and focus | `#0b2a5b` surface, light blue `#9ab0d0` accent with navy text on it |

In TAAG Virtual, `--danger` (Kwanza) and `--accent` are close reds: do not rely on color alone
for errors (icon, text, outline), which WCAG asks anyway.

## Setting the attributes (CSP-safe)

No inline `<script>` in `index.html`. The first statements in `main.tsx` set the attributes
synchronously, before React renders, with the helpers in `src/shared/design-system/theme.ts`:

| Helper | Does |
|---|---|
| `applyInitialTheme()` | Reads the stored preference (`flyavg.theme`, UI preference only), applies it and follows OS changes while it is "system" |
| `applyTheme(preference)` | Sets `data-theme` to the resolved `light` / `dark` |
| `resolveTheme(preference)` | Resolves "system" with `matchMedia` |
| `setAirline(airline \| null)` | Sets or removes `data-airline` |
| `appliedAppearance()` | Reads `{ airline, theme }` back from `<html>`, for UI that reflects it |

The airline comes from the signed-in pilot's airline (session) or from the public page being
shown (`/taag`, `/world`). A `ThemeProvider` with `usePreferences()` (`setTheme` /
`setAirline`) arrives with the first screen that lets the pilot choose; components never touch
`document` directly. The skill does not ask for a theme toggle component yet: the catalog has
its own controls, internal to it.

## Styling approach: Tailwind v4 mapped to CSS variables

Decided (AVG-7): **Tailwind v4**, with the default palette and scales removed so only our
tokens exist.

Decided (AVG-5): the reset lives in its own `@theme` block in `tokens/scales.css`, before the
token definitions, and clears `--color-*`, `--font-*`, `--font-weight-*`, `--text-*`,
`--tracking-*`, `--leading-*`, `--radius-*`, `--shadow-*`, `--inset-shadow-*`,
`--drop-shadow-*`, `--text-shadow-*`, `--ease-*` and `--animate-*` (only `animate-spin` is
redefined). Breakpoints, container widths and the `--spacing` multiplier stay Tailwind's. The
semantic mapping is a separate `@theme inline` block in `index.css`, so utilities reference the
variables and changing `data-airline` or `data-theme` re-themes everything without a rebuild.

```css
/* src/shared/design-system/index.css (excerpt) */
@theme inline {
  --color-surface: var(--surface);
  --color-fg: var(--fg);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-accent-text: var(--accent-text);
  /* … every semantic color … */
  --font-sans: var(--typeface-body);
  --font-display: var(--typeface-display);
  --font-brand: var(--typeface-brand);
  --font-mono: var(--typeface-code);
}
```

Verified (AVG-5) by `tailwind-tokens.test.ts`, which compiles the real `index.css` with
`@tailwindcss/node`: `bg-red-500`, `bg-white`, `text-black`, `shadow-lg`, `font-semibold`,
`tracking-wide`, `ease-in-out` generate nothing, while the token utilities do (positive
control). `bg-transparent`, `text-current` and `bg-inherit` keep working (they are keywords,
not palette values). **Arbitrary values (`bg-[#…]`, `p-[13px]`) still compile in Tailwind
v4**: that rule is enforced by review, not by the build.

## Typography (Decided (AVG-5))

- Fonts are self-hosted in `src/shared/design-system/fonts/` with `font-display: swap`; no
  Google Fonts `<link>` (CSP, privacy). Sora 300/500/700 stays TTF (from the brand kit; no
  woff2 converter was available), Kufam (variable) and JetBrains Mono 500 are woff2.
- Utilities: `font-sans` (Sora, body), `font-display` (display headings: **Kufam only in TAAG
  Virtual**, Sora elsewhere), `font-brand` (always Sora), `font-mono` (JetBrains Mono, flight
  codes, callsigns, ICAO).
- **Kufam's uppercase V reads as U: never use `font-display` on a brand name.** Brand names
  (FlyAVG, AVAGroup, TAAG Virtual, World Virtual) use `font-brand`.
- `h1`–`h3` are Sora 700 in every theme; `font-display` is opt-in on display headings.
- Weights: `font-light` (300, body and highlights), `font-medium` (500, spaced labels),
  `font-bold` (700, titles). No other weight exists.
- Type scale: `text-xs` … `text-4xl` and `text-display` (3 rem, tight tracking), each with
  its line height. `leading-tight|snug|normal|relaxed`, `tracking-tight|normal|label`.
  Spaced labels: `text-xs font-medium uppercase tracking-label`. No `text-[17px]`.
- Numbers in tables and flight data use `tabular-nums`.

## Spacing, radii, shadows, motion, layers (Decided (AVG-5))

- Spacing uses the 4 px multiplier. Steps in use: 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16,
  20, 24 (listed in the catalog). No arbitrary spacing.
- Radii: `rounded-sm|md|lg|xl|full`. Shadows: `shadow-raised` (cards), `shadow-overlay`
  (menus, dialogs, toasts); their color follows the theme.
- Motion: `duration-fast|normal|slow` (120/200/320 ms) and `ease-standard|enter|exit`. Plain
  `transition-*` utilities default to `--duration-normal` and `ease-standard`. Under
  `prefers-reduced-motion` every duration is `0ms`.
- Layers: `z-dropdown`, `z-sticky`, `z-overlay`, `z-modal`, `z-toast`. No numeric `z-50`.

## Rules

1. No raw color anywhere except `primitives.css`. No arbitrary values (`bg-[#…]`, `p-[13px]`).
2. No `style={{ color: … }}`. Dynamic geometry (a progress width, a map size) may use inline
   `style`, never colors.
3. A new token is added in all themes (base, taag, world) for light and dark in the same change,
   and the contrast test still passes.
4. Name tokens by role (`--danger`), never by look (`--red`).
5. Respect `prefers-reduced-motion`: motion tokens collapse to `0ms` under it.
6. Class names are written whole (`bg-danger`), never built (`` `bg-${status}` ``): Tailwind only
   generates classes it finds in the source. Map a value to a literal class instead.

## Anti-patterns

- `.dark` class toggling (we use `data-theme`).
- Airline checks in components (`airline === "taag" ? "bg-…" : …`). Themes do this.
- An inline `<script>` in `index.html` to prevent the theme flash.
- `text-accent` for colored text (use `text-accent-text`).
- `font-display` on a brand name.
