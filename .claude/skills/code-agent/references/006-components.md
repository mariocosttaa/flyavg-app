# 006 - Components

## Purpose

Rules for the own component library in `src/shared/design-system/components/`: anatomy,
variants, accessibility and the catalog. Phase 2 builds it from validated mockups. Decided
(AVG-5): the structure, the helpers and the catalog tooling below.

## Structure (Decided (AVG-5))

```text
src/shared/design-system/
├── tokens/            primitives.css, scales.css, fonts.css (005)
├── themes/            base.css, taag.css, world.css (005)
├── fonts/             Self-hosted font files
├── lib/               Own helpers: cx.ts, variants.ts (phase 2), contrast.ts, theme-tokens.ts
├── components/        One folder per component, re-exported by components/index.ts
├── theme.ts           Theme attribute helpers (005)
└── index.css          Tailwind, tokens, themes and base styles
```

`lib/contrast.ts` and `lib/theme-tokens.ts` serve tests and the catalog only; production code
does not import them.

## No external component libraries

We build every component ourselves: no shadcn, Radix, MUI, Chakra, Headless UI, Mantine, Ant,
React Aria, react-select or date-picker kits. Allowed small utilities: `clsx`, a variant helper
(`cva` or a 20-line own function), `@floating-ui/dom` for positioning if needed. Any new
runtime dependency in the design system needs the owner's approval.

Prefer native elements: `<button>`, `<dialog>`, `<details>`, `<select>`, `<input type="date">`
(styled), `popover` attribute. They bring keyboard and screen reader support for free.

## Anatomy

```text
components/Button/
├── Button.tsx          Implementation
├── Button.variants.ts  Variant map (optional)
├── Button.test.tsx     Behaviour + a11y test
└── index.ts            export { Button } from "./Button"; export type { ButtonProps } …
```

`components/index.ts` re-exports the stable public set. Pages import from
`@/shared/design-system/components`.

```tsx
// components/Button/Button.tsx
import type { ButtonHTMLAttributes, Ref } from "react"
import { cx } from "../cx"
import { buttonVariants, type ButtonVariants } from "./Button.variants"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariants {
  ref?: Ref<HTMLButtonElement>
  loading?: boolean
}

export function Button({ variant, size, density, loading, disabled, className, type = "button", children, ...props }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(buttonVariants({ variant, size, density }), className)}
      {...props}
    >
      {loading && <Spinner aria-hidden />}
      {children}
    </button>
  )
}
```

Decided (AVG-5): `cx` (class join) and `variants` (variant map) are own helpers in
`design-system/lib/`, no `clsx` or `cva` (no new runtime dependency). `cx` exists; `variants`
is written with the first component that has variants (phase 2), with its test. React 19 passes `ref` as a normal prop: no `forwardRef`. Props extend the native element's
attributes so `aria-*`, `onClick`, `form` and friends pass through.

```ts
// components/Button/Button.variants.ts
export const buttonVariants = variants({
  base: "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-50",
  variants: {
    variant: { primary: "bg-accent text-accent-fg", secondary: "border border-border bg-surface-raised text-fg", ghost: "text-fg hover:bg-fg/5", danger: "bg-danger text-danger-fg" },
    size: { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" },
    density: { comfortable: "", compact: "h-8 px-3 text-sm" },
  },
  defaults: { variant: "primary", size: "md", density: "comfortable" },
})
```

## Layers of components

| Kind | Where | May fetch? | May know domain types? |
|---|---|---|---|
| Design system (Button, Field, Table, Dialog, Toast, Pagination, Skeleton, Badge, EmptyState) | `src/shared/design-system/components/` | No | No |
| Shared app components (QueryError, BootScreen wrapper, LanguageSwitcher) | `src/shared/components/` | Via hooks | Yes |
| Domain components shared in one entry (PilotCard, AircraftPicker) | `src/<entry>/components/<domain>/` | Via hooks | Yes |
| Page parts | `pages/…/parts/` | Via hooks | Yes |

Design system components receive text via props (already translated) or use only the
`common` namespace for built-in labels (e.g. "Close", "Next page").

## Accessibility (WCAG 2.2 AA)

1. Keyboard: everything reachable with Tab, operable with Enter/Space, Escape closes overlays,
   focus is trapped in modal dialogs and returned to the trigger on close.
2. Visible focus: `focus-visible` outline using `--focus-ring`, never `outline: none` alone.
3. Names: icon-only buttons need `aria-label` (translated). Inputs have a `<label>`; errors are
   linked with `aria-describedby` and marked `aria-invalid`.
4. Roles: use the native element first. Custom widgets follow the WAI-ARIA Authoring Practices
   pattern (listbox, combobox, tabs, menu) completely, or are not built.
5. Live regions: toasts use `role="status"` (info) or `role="alert"` (errors).
6. Contrast: verified per theme in light and dark (see 005).
7. Motion: transitions respect `prefers-reduced-motion`.
8. Target size: at least 24×24 CSS px; 44×44 for primary touch targets.

Each component test includes at least one role-based query and one keyboard interaction.
Decided (AVG-5): accessibility checks use `axe-core` directly through
`accessibilityViolations(container)` from `src/test/axe.ts` (no `vitest-axe`: unmaintained
since 2022). Each component test and each catalog page test asserts it returns `[]`. axe's
contrast rule is off in jsdom (no layout); contrast is covered by the theme token tests (005).

## Density for admin

Admin uses the same components with `density="compact"` (smaller row height, tighter padding),
provided through a `DensityProvider` set by `AdminLayout`. No forked "AdminTable".

## Catalog

- Every component has catalog entries for each variant, size, density, state (hover, focus,
  disabled, loading, error) and both themes in light and dark.
- The catalog is published on staging. A new component enters the catalog **before** a screen
  uses it. Screens follow the platform template; a screen that needs something new adds it to
  the catalog first.
- Decided (AVG-5): the catalog is an **own Vite entry**, not Storybook or Ladle:
  `catalog/index.html` + `src/catalog/`, served at `/catalog/`. It is built only when
  `VITE_APP_ENV` is `development` or `staging` (`scripts/catalog-environments.mjs`, shared by
  `vite.config.ts` and the bundle check); an unset value counts as production. The bundle
  check fails if the catalog is in a production build or if its code reaches the portal or
  admin graphs, and lint forbids importing `@/catalog` from portal, admin or shared code.
- Layout: `src/catalog/main.tsx` (boot: CSS, theme, i18n, the `catalog` namespace),
  `src/catalog/pages/<Page>/index.tsx` with `parts/`, like the entries (004). Today there is
  one page, `pages/Tokens/`. Phase 2 adds `pages/Components/<Component>/` per component and a
  small router when there is more than one page.
- Every catalog string goes through the `catalog` i18n namespace (pt and en). Catalog-only
  pieces (theme controls, swatches) stay in the catalog's `parts/`, never in the design
  system.
- The catalog switches airline and light/dark live through the `theme.ts` helpers. Theme
  selectors are `:root[...]`, so themes are previewed one at a time, not side by side.

## Rules

- No data fetching, router hooks or domain types inside `design-system/`.
- No hardcoded copy; no raw colors (see 005).
- Controlled and uncontrolled support for inputs (`value`/`defaultValue`, `onChange`).
- `className` is accepted and merged last, for layout tweaks only (margin, width), not colors.
- One component per folder. No "utils" component dumping ground.

## Anti-patterns

- `<div onClick>` as a button.
- Copying a component into a page to "slightly change" it. Add a variant instead.
- Placeholder used as the label.
- A modal built from `<div>` without focus management when `<dialog>` would do.
