# flyavg-app

[![CI](https://github.com/mariocosttaa/flyavg-app/actions/workflows/ci.yml/badge.svg?branch=development)](https://github.com/mariocosttaa/flyavg-app/actions/workflows/ci.yml)

Web client for **FlyAVG**, the AVAGroup platform for **TAAG Virtual** and **World Virtual**.
A client-side SPA built with React 19, Vite, React Router 7 (declarative mode), TypeScript
strict, the React Compiler and Tailwind CSS v4. Data comes from `flyavg-api` (NestJS REST).

The repository ships two separate builds that share one design system:

| Entry                                      | HTML               | Source        | Served at |
| ------------------------------------------ | ------------------ | ------------- | --------- |
| Portal (landing, public pages, pilot area) | `index.html`       | `src/portal/` | `/`       |
| Admin                                      | `admin/index.html` | `src/admin/`  | `/admin/` |

Admin code never reaches the portal bundle: ESLint blocks cross-entry imports and
`npm run build` fails if anything reachable from `index.html` contains admin modules.

## Requirements

- Node.js 22 (`.nvmrc`; `nvm use`) and npm
- Docker, only to build the production image

## Getting started

```bash
nvm use
npm install
cp .env.example .env.local   # adjust the values
npm run dev                  # portal on http://localhost:5173, admin on /admin/
git config core.hooksPath .githooks
```

## Scripts

| Script                             | What it does                                                         |
| ---------------------------------- | -------------------------------------------------------------------- |
| `dev`                              | Vite dev server (both entries, `/admin/*` served by the admin entry) |
| `build`                            | Production build of both entries + bundle boundary check             |
| `preview`                          | Serves `dist/` locally                                               |
| `typecheck`                        | `tsc -b` over app, tests and tooling configs                         |
| `lint` / `lint:check`              | ESLint with fixes / without fixes and zero warnings                  |
| `format` / `format:check`          | Prettier write / check                                               |
| `test` / `test:watch` / `test:cov` | Vitest (jsdom, Testing Library, MSW) once / watch / with coverage    |
| `test:e2e`                         | Playwright smoke against a fresh build on `vite preview`             |
| `api:types` / `api:types:check`    | Generate the API types from the OpenAPI document / fail when stale   |

Checks, cheap to expensive: `typecheck` → `lint:check` → `format:check` → `test` → `build` →
`test:e2e`.

Playwright options: `PLAYWRIGHT_CHANNEL=chrome` runs on the installed Chrome instead of the
downloaded browsers (`npx playwright install chromium`); `E2E_BASE_URL=http://host:port` runs
against an already running deployment, such as the Docker image.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every pull request and push to
`development`, `staging` and `master`, with Node from `.nvmrc`:

- **Lint, test and build:** `typecheck`, `lint:check`, `format:check`, `test:cov`, `build`
  (with the bundle boundary check) and `npm audit --audit-level=high`.
- **Playwright smoke:** `test:e2e` on Chromium; the report is uploaded when it fails.
- **Docker image:** builds the production image without pushing it, to catch Dockerfile breakage.

CI never deploys: Coolify builds and deploys each environment from its branch. Dependabot
(`.github/dependabot.yml`) opens weekly npm and GitHub Actions updates against `development` once `development` is the
default branch on GitHub (today it is the legacy `main`, so Dependabot does not run yet).

## API client

The API contract is `openapi/openapi.json` in `flyavg-api`. `npm run api:types` reads it from an
API checkout next to this repository (`../flyavg-api/openapi/openapi.json`, or the file in
`OPENAPI_PATH`) and writes `src/shared/api/generated/schema.d.ts`, which is committed and never
edited by hand. Calls go through the `openapi-fetch` client and TanStack Query hooks in
`src/shared/api/`; errors are `ApiError`s translated by `code` (`errors` namespace).

## Structure

```text
├── index.html, admin/index.html   HTML entries (no inline scripts)
├── public/                        Static files copied as-is (favicon)
├── src/
│   ├── portal/                    main.tsx, routes.tsx, paths.ts, layouts/, pages/
│   ├── admin/                     main.tsx, routes.tsx, paths.ts, layouts/, pages/
│   ├── shared/
│   │   ├── design-system/         tokens/, themes/, components/, fonts/, theme.ts, index.css
│   │   ├── i18n/                  config.ts, typed keys, locales/{pt,en}/<namespace>.json
│   │   ├── api/                   Generated OpenAPI client, ApiError, query hooks
│   │   ├── auth/, hooks/, lib/    Session types, generic hooks, helpers (env validation)
│   └── test/                      Vitest setup, MSW server and handlers, render helper
├── e2e/tests/                     Playwright specs
├── scripts/                       Build checks (bundle boundaries)
├── deploy/                        nginx config and security headers
└── Dockerfile                     Node 22 build → nginx alpine
```

Coding standards live in the versioned skills under `.claude/skills/` (`code-agent` for app
code, `git-workflow` for branches and commits).

## Themes and i18n

- Design tokens are CSS custom properties. Raw colors exist only in
  `src/shared/design-system/tokens/primitives.css`; Tailwind's default palette and scales are
  removed, so utilities only map to tokens.
- `<html data-airline="taag|world">` switches the airline theme (no attribute = AVAGroup);
  `<html data-theme="light|dark">` is always set at boot from the stored preference or the OS.
- Every visible string goes through i18next. Locales: `pt` (default, pt-PT) and `en`.
  Detection order: stored choice (`flyavg.language`) → browser languages → `pt`.

## Environment

Variables are read and validated with zod at startup (`src/shared/lib/env.ts`). Vite inlines
them at build time, so they are public: never put secrets in `VITE_*`.

| Variable          | Required | Description                              |
| ----------------- | -------- | ---------------------------------------- |
| `VITE_API_URL`    | yes      | Base URL of `flyavg-api`                 |
| `VITE_APP_ENV`    | yes      | `development`, `staging` or `production` |
| `VITE_SITE_URL`   | yes      | Public URL of this app                   |
| `VITE_SENTRY_DSN` | no       | Sentry DSN; Sentry is off without it     |

## Docker

```bash
docker build -t flyavg-app \
  --build-arg VITE_API_URL=https://api.example.com \
  --build-arg VITE_APP_ENV=production \
  --build-arg VITE_SITE_URL=https://app.example.com .
docker run --rm -p 8080:80 flyavg-app
```

nginx serves both SPA fallbacks (`/admin/*` → `admin/index.html`, everything else →
`index.html`), caches hashed assets for a year, revalidates HTML on every load and sends a
strict CSP (no inline scripts or styles). `CSP_CONNECT_SRC` defaults to `'self'` plus the API
URL given at build time. The container healthcheck fetches the portal HTML.

## Git

- `development`: integration branch; work branches are `<type>/AVG-123`.
- `master`: production.
- `main`: legacy static landing page, kept apart from the app.

Conventional Commits in English, rebase-only linear history, PR descriptions in pt-PT. Full
rules in the `git-workflow` skill (`flyavg-git`). Enable the repository hooks once per clone
with `git config core.hooksPath .githooks`.
