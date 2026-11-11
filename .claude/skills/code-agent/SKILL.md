---
name: flyavg-app-code
description: Coding standards and file organization for flyavg-app, the FlyAVG React 19 + Vite + React Router 7 + TypeScript SPA (pilot portal with public landing, and a separate admin entry). Use whenever writing or changing app code in flyavg-app - pages, routes, layouts, guards, components, hooks, design tokens, airline themes (TAAG Virtual, World Virtual), light/dark mode, i18n strings (pt/en), API calls with the generated OpenAPI client and TanStack Query, auth and session, forms and validation, lists with pagination/search/filters, loading/empty/error states, unit or e2e tests, Vite config, env vars or build performance. Triggers - "new page", "add a route", "create a component", "design tokens", "theme", "translate", "i18n", "call the API", "query hook", "form", "pagination", "filters", "write tests", "Playwright", "Vitest", "flyavg-app".
---

# flyavg-app code standards

flyavg-app is the FlyAVG web client for AVAGroup (TAAG Virtual and World Virtual). It is a
client-side SPA built with **React 19, Vite, React Router 7 (declarative mode), TypeScript
strict** and the **React Compiler**. It is not Next.js: there are no server components, no
file-based routing and no server runtime. Data comes from `flyavg-api` (NestJS REST) through a
client generated from its OpenAPI document.

Two entries share one component library:

- **Portal** (`src/portal/`): landing, public pages and the pilot area.
- **Admin** (`src/admin/`): denser layout for tables and forms. Admin code must never ship in
  the portal bundle.

Sibling skills: **`flyavg-git`** (branches, commits, PR), **`flyavg-app-review`** (review at
the end of every ticket), **`flyavg-promote`** (promotions between long-lived branches).

## Step 0: read the references for your change

Always read `references/001-naming-and-language.md`, `references/002-repo-structure.md` and
`references/015-code-style.md` (shared with flyavg-api) first. Then read the files for the kind of change, in this order:

| Change | Read |
|---|---|
| New page or sub-route | 003, 004, 011, 012, 013 |
| List, table or search screen | 003, 004, 007, 008, 012, 013 |
| Form (create/edit, login) | 004, 007, 010, 011, 012, 013 |
| Component in the design system | 005, 006, 011, 013 |
| Tokens, themes, light/dark | 005, 006 |
| API call, query or mutation | 007, 012, 013 |
| Auth, session, guards, permissions | 003, 007, 009, 013 |
| Translations, dates, numbers | 011 |
| Vite config, env vars, bundle size, deploy | 002, 014 |
| Tests only | 013 |

Snippets and folder layouts come only from these references. "Decided (AVG-7)" marks a
binding architecture decision: follow it as a rule. "Open (...)" marks something still
undecided: if the task depends on it, ask the user before building something hard to undo.
"Decision pending (AVG-5)" or "(AVG-6)" means that ticket has not settled it yet: follow the
proposal, and say in your summary that it is still pending.

## Core rules

1. **Folder per page.** `pages/<Area>/<Page>/index.tsx` with a default export in PascalCase,
   page-private components in `parts/`, optional `skeleton.tsx`, sub-routes as subfolders
   (`new/`, `edit/`). See 004.
2. **Routes in one file per entry** (`src/portal/routes.tsx`, `src/admin/routes.tsx`), every
   page `lazy()` loaded, guards as pathless layout routes. See 003.
3. **Own design system only.** Components come from `@/shared/design-system/components`. A new
   component enters the catalog first, then a screen uses it. Screens follow the platform
   template. See 005, 006.
4. **Tokens, not values.** Colors, font sizes, spacing, radii and shadows come from tokens
   (CSS custom properties). Themes switch with `data-airline` and `data-theme` on `<html>`.
5. **Every visible string goes through i18n** with namespaced semantic keys
   (`auth.login.title`), in both `pt` and `en`. API errors are translated by `code`. See 011.
6. **API access only through the generated client and query hooks** in `src/shared/api/`.
   Never `fetch` from a component. Never hand-write types that the OpenAPI already gives. See 007.
7. **List state lives in the URL**: page, limit, search, sort and filters. Search and filter
   changes reset `page` to 1; search is debounced; pagination links keep other params. See 008.
8. **Session**: access token in memory only, refresh token in an httpOnly cookie, single-flight
   refresh on 401, retry once, else logout. See 009.
9. **Forms**: zod schema + react-hook-form, server errors mapped to fields or a form summary.
   See 010.
10. **Every async screen has loading, empty and error states.** Skeletons for loading, own
    `Toast` for feedback, error boundaries per layout. See 012.
11. **Tests are part of the change.** Unit/component tests with Vitest + Testing Library + MSW;
    Playwright for critical flows. CI runs both. See 013.
12. **Code and comments in en-US.** Comments explain why, at most 2 lines. See 001.
13. **CSP-friendly.** No inline scripts, no `dangerouslySetInnerHTML` with untrusted data, no
    `eval`, no inline `style` for colors.

## Checks, cheap to expensive

Run them in this order and stop at the first failure. Fix, then restart from that step.

```bash
npm run typecheck      # tsc -b --noEmit
npm run lint           # eslint, includes portal/admin import boundaries
npm run test           # vitest run (unit + component, MSW)
npm run build          # vite build, both entries
npm run test:e2e       # playwright, when the change touches a critical flow
```

Script names are a proposal until AVG-6 scaffolds the repo (Decision pending (AVG-6)). If a
script is missing, run the underlying tool and say so.

Before handing over: all of the above green, no new warnings, both locales updated, and a
read-only review run with **`flyavg-app-review`**.

## Never do

- Hardcode user-facing strings in JSX, toasts, `aria-label`, `title`, `alt` or placeholders.
- Write raw hex/rgb/hsl colors, pixel font sizes or ad-hoc spacing outside the token files.
  No arbitrary values like `bg-[#ce1126]`.
- Add a component library or headless kit (shadcn, Radix, MUI, Chakra, Headless UI, Mantine,
  Ant, react-select…). Ask the owner first if you think one is needed.
- Store tokens in `localStorage`, `sessionStorage` or a readable cookie.
- Use `any`, `as any`, `@ts-ignore` or non-null `!` to silence the compiler. Use `unknown` and
  narrow it.
- Import admin code from the portal, or portal code from admin. Shared code lives in
  `src/shared/`.
- Keep list state (page, search, filters, sort) in `useState` only.
- Call `fetch` directly in components or edit generated API files by hand.
- Add inline `<script>` tags to the HTML or inline event handler strings.
- Commit, push or open a PR without the user asking. Git rules are in `flyavg-git`.
- Copy patterns from GraphQL clients, Next.js or server components. This is a Vite SPA.
