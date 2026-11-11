# 002 - Repository structure

## Purpose

Where every file goes, and how the portal and admin stay apart. Decided (AVG-7): this is the
repository layout; AVG-6 scaffolds it.

## Decision: Vite multi-page build with two entries

| Option | Verdict |
|---|---|
| One entry, admin routes lazy-loaded | Rejected. Admin chunks are still in the portal build graph, the router and providers are shared, and one wrong static import pulls admin code into the portal. |
| **Two HTML entries (Vite multi-page)** | **Chosen.** Each entry has its own `main.tsx`, router, providers and layout. The portal bundle cannot reach admin modules, and the boundary is enforced by lint and checked at build time. Prerendering the portal's public routes later only touches the portal entry. |

```ts
// vite.config.ts (sketch)
import { defineConfig } from "vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import path from "node:path"

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  build: {
    rollupOptions: {
      input: {
        portal: path.resolve(__dirname, "index.html"),
        admin: path.resolve(__dirname, "admin/index.html"),
      },
    },
  },
})
```

The exact React Compiler plugin wiring follows the Vite plugin version installed at AVG-6.

The admin entry lives under `/admin/`. Its router uses `basename="/admin"`. nginx needs a
second SPA fallback:

```nginx
location /admin/ { try_files $uri $uri/ /admin/index.html; }
location /       { try_files $uri $uri/ /index.html; }
```

In `vite dev` and `vite preview` the history fallback serves the root `index.html` (the
portal) for unknown paths, so a deep link like `/admin/pilots` would open the portal. Add a
small dev/preview middleware plugin that rewrites `/admin/*` to `/admin/index.html`, or run
admin e2e against the nginx image. Verify at AVG-6.

Decided (AVG-7): admin is served from `/admin/` on the app's own domain, with its own build
entry, never from a subdomain. Admin has no login page: sign-in always goes through the portal
(003).

| Environment | App (portal) | Admin | API |
|---|---|---|---|
| Development | `dev.flyavg.com` | `dev.flyavg.com/admin/` | `api.dev.flyavg.com` |
| Production | `app.flyavg.com` | `app.flyavg.com/admin/` | `api.flyavg.com` |

App and API are subdomains of the same site, so the refresh cookie (`sameSite: strict`) works
(009). The current landing stays on `flyavg.com` until the new one (phase 3) replaces it.

## Tree

```text
flyavg-app/
├── index.html                  Portal HTML (no inline scripts)
├── admin/index.html            Admin HTML
├── public/                     Static files copied as-is (favicons, robots.txt)
├── src/
│   ├── portal/
│   │   ├── main.tsx            Boot: theme attrs, i18n, providers, router
│   │   ├── routes.tsx          All portal routes (lazy pages, guards, layouts)
│   │   ├── layouts/
│   │   │   ├── PublicLayout/   Landing and public pages
│   │   │   └── PilotLayout/    Signed-in pilot area (sidebar, top bar)
│   │   └── pages/
│   │       ├── Landing/
│   │       ├── Auth/{Login,ForgotPassword,ResetPassword}/
│   │       ├── Flights/{Bookings,Schedule}/
│   │       ├── Pilot/{Logbook,Profile}/
│   │       └── NotFound/
│   ├── admin/
│   │   ├── main.tsx
│   │   ├── routes.tsx
│   │   ├── layouts/AdminLayout/
│   │   └── pages/
│   │       ├── Dashboard/
│   │       ├── Pilots/{index.tsx,parts/,edit/}
│   │       ├── Fleet/
│   │       └── NotFound/
│   ├── shared/
│   │   ├── design-system/
│   │   │   ├── tokens/         Primitive + semantic tokens (CSS custom properties)
│   │   │   ├── themes/         taag.css, world.css (light + dark per airline)
│   │   │   ├── components/     Own component library (Button, Field, Table, Pagination…)
│   │   │   └── index.css       Imports tokens, themes and base styles
│   │   ├── api/
│   │   │   ├── generated/      openapi-typescript output. Never edit by hand
│   │   │   ├── client.ts       openapi-fetch client + auth-aware fetch
│   │   │   ├── query-keys.ts   Query key factories
│   │   │   ├── errors.ts       ApiError, code extraction
│   │   │   └── hooks/          TanStack Query hooks per domain (bookings.ts, pilots.ts…)
│   │   ├── auth/               SessionProvider, token store, guards, permissions
│   │   ├── i18n/               config.ts, types.d.ts, locales/{pt,en}/<namespace>.json
│   │   ├── hooks/              Generic hooks (use-list-params, use-debounced-value…)
│   │   ├── lib/                Pure helpers (format, url, env)
│   │   └── providers/          AppProviders (QueryClient, i18n, theme, toasts)
│   ├── catalog/                Component catalog entry (phase 2, published on staging)
│   └── test/                   setup.ts, MSW handlers, factories, render helpers
├── e2e/                        Playwright: tests/, pages/ (POM), fixtures/
├── deploy/nginx/               Dockerfile + nginx.conf
├── vite.config.ts, vitest.config.ts, playwright.config.ts
├── tsconfig.json, tsconfig.app.json, tsconfig.node.json
└── eslint.config.js
```

`src/catalog/` would be a third Vite entry built only for staging. Decision pending (AVG-5).

## What goes where

| Question | Place |
|---|---|
| Used by only one page | `pages/<Area>/<Page>/parts/` |
| Used by several pages of one entry, domain-specific | `src/<entry>/components/<domain>/` |
| Visual building block with no domain data | `src/shared/design-system/components/` |
| Talks to the API | `src/shared/api/hooks/<domain>.ts` |
| Pure function (format, parse) | `src/shared/lib/` |
| Hook with no domain knowledge | `src/shared/hooks/` |

Promote code from `parts/` upward only when a second consumer appears.

## Boundaries (enforced)

1. `src/portal/**` must not import `@/admin/**`, and `src/admin/**` must not import
   `@/portal/**`. Both may import `@/shared/**`.
2. `src/shared/**` imports neither entry.
3. `src/shared/design-system/**` must not import `@/shared/api/**` (components are data-free).

```js
// eslint.config.js (excerpt)
{
  files: ["src/portal/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": ["error", { patterns: [
      { group: ["@/admin/*", "**/admin/**"], message: "Portal must not import admin code." },
    ] }],
  },
},
```

Add the mirror rule for admin, and one for `shared`. CI also checks the build output: no file
in `dist/assets` referenced by `dist/index.html`'s import graph contains admin modules (a
small script that reads the Vite manifest, `build.manifest: true`).

## Configuration kept from day one

- `tsconfig.app.json`: `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`,
  `noUnusedParameters`, `verbatimModuleSyntax`, `paths: { "@/*": ["./src/*"] }`.
- ESLint flat config: `typescript-eslint` recommended-type-checked, `react-hooks`,
  `react-refresh`, `jsx-a11y`, the boundary rules above.
- Imports: external packages, then `@/…`, then relative. No `../../../` chains: use `@/`.
