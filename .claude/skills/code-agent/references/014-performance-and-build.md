# 014 - Performance, build and environments

## Purpose

How the app stays fast and how it is built for dev, staging and prod: code splitting, the
React Compiler, environment variables, security headers and prerendering later.

## Code splitting

1. Two entries (portal, admin): admin never ships to pilots (see 002).
2. Every page is `lazy()` (see 003). Layouts, providers and the design system core are in the
   entry chunk.
3. Heavy libraries load only where used, behind `lazy()` or dynamic `import()`: MapLibre GL
   (maps), charts, rich editors. Never import them from `shared/` index files.
4. i18n namespaces load with their route (see 011).
5. Prefetch the next likely chunk on intent (hover/focus of a nav link) with a small
   `prefetchRoute(() => import(...))` helper, not on page load.

Check after any dependency or route change:

```bash
npm run build   # Vite prints chunk sizes; investigate any new chunk over ~150 kB gzip
```

A bundle visualiser (`rollup-plugin-visualizer`) can be run locally; do not commit its report.

## React Compiler

On for the whole app (Babel preset through the Vite React plugin, see 002). Consequences:

- Do not add `useMemo`, `useCallback` or `memo` by default; the compiler memoises. Add them
  only with a measured reason and a comment.
- Code must follow the Rules of React (pure render, no mutation of props/state, hooks at top
  level). `eslint-plugin-react-hooks` (recommended, includes compiler rules) must pass.
- If the compiler bails out of a component, fix the rule violation rather than disabling it.

## Environment variables

Vite inlines `VITE_*` into the bundle **at build time**. They are public: anyone can read them.
**Never put secrets in `VITE_*`.**

```ts
// src/shared/lib/env.ts
import { z } from "zod"

const schema = z.object({
  VITE_API_URL: z.url(),
  VITE_APP_ENV: z.enum(["development", "staging", "production"]),
  VITE_SITE_URL: z.url(),
  VITE_SENTRY_DSN: z.string().optional(),
})

// Fail fast at startup with a clear message instead of broken requests later.
export const env = schema.parse(import.meta.env)
```

- Import `env` from this module; never read `import.meta.env` elsewhere.
- Declare the same keys in `src/vite-env.d.ts` (`ImportMetaEnv`) for editor types.
- Keep `.env.example` with every key and a safe placeholder. `.env*` files with real values are
  not committed.

### One build per environment, or runtime config

Decided (AVG-7): one build per environment, with build args per environment. The `VITE_*`
variables are validated at startup (above). There is no runtime configuration (no
`/config.json`).

| Branch | Environment | App | API (`VITE_API_URL`) |
|---|---|---|---|
| `development` | Dev, automatic deploy | `https://dev.flyavg.com` | `https://api.dev.flyavg.com` |
| `master` | Production, only with explicit approval | `https://app.flyavg.com` | `https://api.flyavg.com` |
| `staging` | Later, when the branch is created | | |

## Security headers (nginx)

The SPA is served by nginx (Docker). Headers set there:

- `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self';
  img-src 'self' data: <tiles>; connect-src 'self' <api> <tiles>; font-src 'self';
  frame-ancestors 'none'; base-uri 'self'; form-action 'self'`. `<api>` is the environment's
  API (`https://api.dev.flyavg.com` or `https://api.flyavg.com`). No `'unsafe-inline'`, no `'unsafe-eval'`.
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny what we do not
  use).

What this means for code:

- No inline `<script>` or inline event handlers in HTML. Theme boot runs from `main.tsx` (see
  005).
- No runtime-injected `<style>` tags with dynamic content. Check that any added library works
  under `style-src 'self'` (MapLibre needs its CSS file imported, not injected).
- Fonts are self-hosted.
- No `eval`, `new Function`, or string `setTimeout`.

## Caching

- Hashed assets in `/assets/`: `Cache-Control: public, max-age=31536000, immutable`.
- `index.html` and `admin/index.html`: `no-cache`, so a deploy is picked up at once.
- SPA fallback per entry (see 002).

## Runtime performance

- Lists use server pagination (see 008); no client-side loading of all records.
- Long tables in admin stay paginated; virtualise only if a screen really needs > 200 rows.
- Images: explicit `width`/`height`, `loading="lazy"` below the fold, modern formats (AVIF/WebP)
  with fallbacks for hero images.
- Avoid layout shift: skeletons match content size; fonts use `font-display: swap` with
  metric-compatible fallbacks.
- Targets for the portal entry on a mid-range phone: LCP < 2.5 s, INP < 200 ms, CLS < 0.1.
  How they are measured in CI is Open (before launch, with the metrics system).

## Prerendering public routes (phase 3)

Public routes (landing, airline pages) will be prerendered at build time to static HTML for
SEO and social previews (Open Graph, Twitter cards). Plan for it now:

- Public pages must render without the session and without browser-only APIs at module load
  (`window`, `localStorage` access goes inside effects or guarded helpers).
- Page titles and meta come from a small `<PageMeta>` component that can be collected at
  prerender time.
- Data for public pages should be fetchable at build time or be static content.
- Tool choice (a Vite prerender plugin, or a small script that renders routes with
  `react-dom/server` `prerender`) is Open (phase 3, landing).

## Anti-patterns

- `import "maplibre-gl"` in a shared module.
- Secrets, private API keys or admin URLs in `VITE_*`.
- Reading `import.meta.env.VITE_API_URL` directly in a component.
- Blanket `useMemo`/`useCallback` everywhere "for performance" with the compiler on.
