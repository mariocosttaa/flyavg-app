# 005 - Design tokens and themes

## Purpose

Where visual values live, how airline themes and light/dark switch, and how components consume
tokens. Phase 1 of the design system is tokens only. Decision pending (AVG-5) for everything
in this file.

## Three layers

| Layer | File | Example | Who uses it |
|---|---|---|---|
| Primitive | `tokens/primitives.css` | `--navy-900: #0f1b2d;` `--taag-red-600: #ce1126;` | Only theme files |
| Semantic | `themes/*.css` | `--surface`, `--fg`, `--accent`, `--danger` | Tailwind mapping, rare custom CSS |
| Utility | `index.css` `@theme` | `bg-surface`, `text-fg`, `p-4`, `rounded-md` | Components |

**Raw color values (hex, rgb, hsl, oklch) appear only in `tokens/primitives.css`.** Every other
file uses semantic names.

## Theme switching

Two attributes on `<html>`:

- `data-airline`: `taag` or `world`. No attribute = AVAGroup group theme (landing, admin,
  group pages). Whether the group theme is the default or a third value
  (`data-airline="avagroup"`) is to confirm.
- `data-theme`: `light` or `dark`, **always set** to the resolved value. When the pilot's
  preference is "system", the boot code resolves it with `matchMedia` and keeps it in sync.
  CSS therefore never needs a `prefers-color-scheme` media query, and airline dark overrides
  always win over the base theme.

```css
/* src/shared/design-system/themes/base.css: AVAGroup group theme */
:root {
  --surface: var(--paper-50);
  --surface-raised: var(--white);
  --fg: var(--navy-900);
  --fg-muted: var(--slate-500);
  --border: var(--navy-900-a12);
  --accent: var(--amber-500);
  --accent-fg: var(--navy-900);
  --danger: var(--red-600);
  --danger-fg: var(--white);
  --focus-ring: var(--amber-500);
}

:root[data-theme="dark"] { --surface: var(--navy-900); --fg: var(--paper-50); /* … */ }
```

```css
/* src/shared/design-system/themes/taag.css */
:root[data-airline="taag"] {
  --accent: var(--taag-red-600);
  --accent-fg: var(--white);
}
:root[data-airline="taag"][data-theme="dark"] { --accent: var(--taag-red-400); }
```

Each airline file overrides only the semantic tokens that differ. Every override is defined
for light and dark, and every text/background pair must reach WCAG AA contrast (4.5:1 body,
3:1 large text and UI borders). Values come from the brand kits; never invent a color.

## Setting the attributes (CSP-safe)

No inline `<script>` in `index.html`. The first statement in `main.tsx` sets the attributes
synchronously, before React renders:

```ts
// src/shared/design-system/theme.ts
const THEME_KEY = "flyavg.theme" // UI preference only: never put tokens or user data here

export type ThemePreference = "light" | "dark" | "system"
export type Airline = "taag" | "world"

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)")

export function applyInitialTheme(): void {
  applyTheme(readPreference() ?? "system")
  // Follow OS changes while the preference is "system".
  darkQuery.addEventListener("change", () => {
    if ((readPreference() ?? "system") === "system") applyTheme("system")
  })
}

export function applyTheme(preference: ThemePreference): void {
  const resolved = preference === "system" ? (darkQuery.matches ? "dark" : "light") : preference
  document.documentElement.dataset.theme = resolved
}

export function setAirline(airline: Airline | null): void {
  if (airline) document.documentElement.dataset.airline = airline
  else delete document.documentElement.dataset.airline
}

function readPreference(): ThemePreference | null {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === "light" || value === "dark" || value === "system" ? value : null
  } catch {
    // Private mode or blocked storage: fall back to the system preference.
    return null
  }
}
```

The airline comes from the signed-in pilot's airline (session) or from the public page being
shown (`/taag`, `/world`). A `ThemeProvider` exposes `usePreferences()` with
`setTheme` / `setAirline`; components never touch `document` directly.

## Styling approach: Tailwind v4 mapped to CSS variables (proposal)

| Option | For | Against |
|---|---|---|
| **Tailwind v4 `@theme` over CSS variables** | One utility vocabulary, tokens are the only allowed values, no CSS file per component, fast to build screens from mockups | Long class strings; needs a variant helper |
| CSS Modules + variables | Plain CSS, scoped by default | More files, easy to drift from tokens, slower to iterate |

Proposal: **Tailwind v4**, with the default palette and scales removed so only our tokens
exist. Decision pending (AVG-5).

```css
/* src/shared/design-system/index.css */
@import "tailwindcss";
@import "./tokens/primitives.css";
@import "./themes/base.css";
@import "./themes/taag.css";
@import "./themes/world.css";

@theme inline {
  --color-*: initial;            /* drop Tailwind's palette: no bg-red-500 (verify at AVG-5) */
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-fg: var(--fg);
  --color-fg-muted: var(--fg-muted);
  --color-border: var(--border);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-danger: var(--danger);
  --color-danger-fg: var(--danger-fg);
  --color-focus-ring: var(--focus-ring);
  --font-sans: var(--font-body);
  --font-display: var(--font-heading);
  --font-mono: var(--font-code);
}

@layer base {
  body { @apply bg-surface text-fg font-sans antialiased; }
}
```

Verify at AVG-5 that `--color-*: initial` behaves as intended inside `@theme inline` (and
what it does to `white`, `black`, `transparent`, `current`); if not, reset the palette in a
separate `@theme` block. `@theme inline` makes utilities reference the variable, so changing `data-airline` or
`data-theme` re-themes everything without a rebuild.

## Typography and spacing

- Font families are tokens (`--font-body`, `--font-heading`, `--font-code`). Fonts are self-hosted
  `woff2` files in `src/shared/design-system/fonts/` with `font-display: swap`. No Google Fonts
  `<link>` (CSP, privacy).
- A type scale of named steps (`text-xs` … `text-3xl`, `text-display`) with line heights.
  No `text-[17px]`.
- Spacing uses the 4 px scale (`p-1` = 4 px … `p-16`). No arbitrary spacing.
- Radii (`rounded-sm|md|lg|full`) and shadows (`shadow-raised`, `shadow-overlay`) are tokens too.
- Numbers in tables and flight data use `tabular-nums`.

## Rules

1. No raw color anywhere except `primitives.css`. No arbitrary values (`bg-[#…]`, `p-[13px]`).
2. No `style={{ color: … }}`. Dynamic geometry (a progress width, a map size) may use inline
   `style`, never colors.
3. A new token is added in all themes (base, taag, world) for light and dark in the same change.
4. Name tokens by role (`--danger`), never by look (`--red`).
5. Respect `prefers-reduced-motion`: motion tokens collapse to `0ms` under it.

## Anti-patterns

- `.dark` class toggling (we use `data-theme`).
- Airline checks in components (`airline === "taag" ? "bg-…" : …`). Themes do this.
- An inline `<script>` in `index.html` to prevent the theme flash.
