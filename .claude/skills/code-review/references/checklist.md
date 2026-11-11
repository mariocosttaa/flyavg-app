# flyavg-app review checklist

Check only what the diff touches, but check it fully. Numbers in brackets point to
`.claude/skills/code-agent/references/`.

## 1. Scope and hygiene

- [ ] The change does what the ticket asked and nothing unrelated (no drive-by refactors
      without a reason in the ticket folder).
- [ ] No `console.log`, `debugger`, commented-out code, or TODO without a ticket.
- [ ] No secrets, tokens, private URLs or personal data in code, tests, fixtures or `VITE_*` [014].
- [ ] New dependencies are justified; no component library or headless kit added [006].
- [ ] Generated API files (`src/shared/api/generated/`) changed only by regeneration, matching
      the pinned API version [007].

## 2. Naming, language, comments [001]

- [ ] File, folder, hook, component and route names follow the naming table.
- [ ] URL segments and query params are English kebab-case / camelCase.
- [ ] Code and comments in en-US; comments explain why, max 2 lines, no ticket codes.
- [ ] Domain words match the API (`booking`, `pilot`, `aircraft`…).

## 3. Structure and boundaries [002, 004]

- [ ] Pages are `pages/<Area>/<Page>/index.tsx` with a default export; private parts in
      `parts/`; sub-routes as subfolders; `skeleton.tsx` where the page loads data.
- [ ] Nothing in `src/portal/**` imports `@/admin/**` or the reverse; `src/shared/**` imports
      neither entry; design system imports no API code.
- [ ] Code used by one page is not in `shared/`; code used by several is not in `parts/`.
- [ ] Imports use `@/` instead of long relative chains.

## 4. Routing and auth [003, 009]

- [ ] Every new page is `lazy()` and registered in the entry's `routes.tsx`, inside the right
      guard and layout.
- [ ] Layout `Suspense` and error boundary cover the new route.
- [ ] `?redirect=` always goes through `safeRedirect`.
- [ ] Permission checks use `can()` / `PermissionRoute` with real permission names and the
      right scope (group vs airline).
- [ ] Access token only in memory; no token in `localStorage`, `sessionStorage`, URLs or logs.
- [ ] Refresh is single-flight; each request retries at most once; login/refresh/logout are
      excluded from the retry.
- [ ] Logout clears the token, the query cache and session state even if the request fails.

## 5. Data fetching [007]

- [ ] API calls only through `api` and hooks in `src/shared/api/hooks/`; no `fetch` in
      components; no hand-written response types.
- [ ] Query keys come from the factory and include every parameter.
- [ ] Mutations invalidate or update the right keys; no blanket `invalidateQueries()`.
- [ ] `signal` passed for cancellation; 4xx not retried.
- [ ] Errors shown by `code` through i18n, never the API's `message`.

## 6. Lists: URL state [008]

- [ ] `page`, `limit`, `search`, `sort` and filters live in the URL search params.
- [ ] Changing search, sort, limit or filters removes `page`.
- [ ] Search is debounced and written with `replace`.
- [ ] Prev/next links keep all other params; default values are omitted from the URL.
- [ ] Invalid `page`/`limit`/`sort`/filter values fall back safely; `limit` ≤ 100.
- [ ] Out-of-range page is clamped; previous data stays visible while the next page loads.

## 7. Forms [010]

- [ ] zod schema + react-hook-form; schema messages are i18n keys.
- [ ] API field errors mapped to fields; other errors in `FormErrorSummary` + toast.
- [ ] Labels, `aria-invalid`, `aria-describedby` wired by `Field`; focus moves to the first
      error; submit disabled only while submitting.

## 8. i18n [011]

- [ ] No user-visible literal in JSX, `aria-label`, `title`, `alt`, `placeholder` or toasts.
- [ ] Every new key exists in `pt` and `en`; unused keys removed.
- [ ] Keys are semantic and namespaced; plurals use `count`; no concatenated fragments.
- [ ] Portuguese is pt-PT, formal, no Brazilian forms.
- [ ] Dates, times and numbers use the `Intl` helpers with the app locale; flight times in UTC
      where the screen expects it.

## 9. Design system, tokens, accessibility [005, 006]

- [ ] Only design system components; new components were added to the catalog first.
- [ ] No raw colors, arbitrary Tailwind values or inline color styles; new tokens defined for
      base, TAAG and World in light and dark.
- [ ] No airline-specific conditionals in components (themes handle it).
- [ ] Native elements first; keyboard works; visible focus; dialogs trap and return focus.
- [ ] Icon-only buttons have translated accessible names; contrast checked in both themes.
- [ ] Admin screens use `density="compact"`, not forked components.

## 10. States [012]

- [ ] Loading (skeleton), empty (no data vs no results), error (with retry) and success are
      all handled.
- [ ] No empty `catch`; no raw errors or stack traces shown.
- [ ] Destructive actions confirm with the object's name.

## 11. Tests [013]

- [ ] Tests cover the changed behaviour and would fail without the change.
- [ ] List pages: URL rules, empty, error. Forms: validation, server errors, success.
      Auth: refresh/retry/expiry when touched.
- [ ] Queries by role/label; `user-event`; MSW with `onUnhandledRequest: "error"`; no real
      network; no snapshots of whole pages.
- [ ] E2E updated when a critical flow changed (login, session expiry, bookings list,
      booking creation, theme/language, admin access).
- [ ] Test comments: header line, setup lines, non-obvious mocks.

## 12. Performance, build, security [014]

- [ ] Heavy libraries (MapLibre GL, charts) loaded lazily, not from shared index files.
- [ ] No needless `useMemo`/`useCallback`/`memo` (React Compiler is on); no Rules of React
      violations.
- [ ] `env` read only through `src/shared/lib/env.ts`; new `VITE_*` keys added to the schema,
      types and `.env.example`; none is a secret.
- [ ] CSP-safe: no inline scripts, no `eval`, no injected `<style>`, no
      `dangerouslySetInnerHTML` with untrusted content.
- [ ] Build passes; no unexpected large chunk; portal build output contains no admin modules
      (check the Vite manifest or grep `dist/assets` reachable from `dist/index.html`).
- [ ] Public pages render without session or browser-only APIs at module load (prerender
      readiness).

## 13. Checks run by the reviewer

- [ ] `npm run typecheck` green.
- [ ] `npm run lint` green, including boundary rules.
- [ ] `npx vitest run <changed paths>` green.
- [ ] `npm run build` green.

## Code style (shared with the other repo)

- [ ] Names say what the thing is: no abbreviations, no `tmp`/`data`/`item` where a domain word exists, booleans read as questions.
- [ ] Steps separated by blank lines; early returns; no nested ternaries; nesting and parameter limits respected by extracting named functions, not by disabling lint.
- [ ] Every `eslint-disable` is on one line and carries a reason after `--`.
- [ ] Comments explain why, in English; no commented-out code; `TODO(AVG-<n>)` only.
