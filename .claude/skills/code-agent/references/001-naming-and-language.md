# 001 - Naming and language

## Purpose

One table for how things are named, and one for which language goes where. Every other
reference assumes these rules.

## Naming

| What | Style | Example |
|---|---|---|
| Page folder | `PascalCase/` under `pages/<Area>/` | `pages/Flights/Bookings/` |
| Page file | `index.tsx`, default export, PascalCase function | `export default function Bookings()` |
| Page-private components | `parts/PascalCase.tsx` | `parts/BookingsTable.tsx` |
| Page skeleton | `skeleton.tsx` | `pages/Flights/Bookings/skeleton.tsx` |
| Sub-route folder | `kebab-case/` | `new/`, `edit/` |
| Design system component | `PascalCase/` folder + `PascalCase.tsx` | `components/Button/Button.tsx` |
| Hook file | `use-kebab-case.ts`, function `useCamelCase` | `use-list-params.ts` → `useListParams` |
| Other `.ts` files | `kebab-case.ts` | `api-client.ts`, `error-codes.ts` |
| Provider | `PascalCaseProvider.tsx` | `SessionProvider.tsx` |
| Guard | `PascalCaseRoute.tsx`, named export | `PrivateRoute.tsx`, `GuestRoute.tsx` |
| Types, interfaces, enums | `PascalCase` | `BookingStatus`, `ListParams` |
| Variables, functions, props | `camelCase` | `currentPilot`, `onSubmit` |
| Module constants | `SCREAMING_SNAKE_CASE` | `DEFAULT_LIMIT`, `MAX_LIMIT` |
| Env vars | `VITE_SCREAMING_SNAKE` | `VITE_API_URL` |
| URL segments | `kebab-case`, **English** | `/flights/bookings`, `/pilot/logbook` |
| Query params | `camelCase`, English | `?page=2&search=fnc&status=open` |
| i18n keys | `namespace.area.item`, camelCase segments | `flights.bookings.emptyTitle` |
| CSS tokens | `--kebab-case` by role | `--color-surface`, `--space-4` |
| Unit test | next to the file, `.test.ts(x)` | `Pagination.test.tsx` |
| E2E spec | `e2e/tests/<area>/<journey>.spec.ts` | `e2e/tests/auth/login.spec.ts` |
| Branch | `<type>/AVG-123` | `feature/AVG-42` (see `flyavg-git`) |

Domain words follow the API. If the API says `booking`, the app says `booking`, not
`reservation`. Abbreviations only when standard in the domain: `ICAO`, `IATA`, `PIREP`, `id`,
`url`.

## Language

| Context | Language |
|---|---|
| Code, identifiers, comments, test names | en-US |
| URL segments, query params, file and folder names | en-US |
| UI strings | i18n keys, translated to `pt` (default, pt-PT, formal) and `en` |
| Commit messages | English (see `flyavg-git`) |
| PR description | pt-PT (see `flyavg-git`) |
| Skills and agent instructions | English |

Portuguese text never appears in `.ts`/`.tsx` files: it lives only in `src/shared/i18n/locales/pt/*.json`.

## Brand names

Write them as the brand does: **AVAGroup**, **TAAG Virtual**, **World Virtual**, **FlyAVG**.
Brand names in UI still go through i18n (they may sit inside a sentence), but the value is the
same in both locales.

## Comments

1. en-US, at most 2 lines per block.
2. Explain **why**, not what. If the why is obvious, write nothing.
3. Required at non-obvious conditions, workarounds, security decisions, magic numbers (prefer
   a named constant), and every mock or fixture value in tests.
4. Forbidden: restating code, ticket codes (`// AVG-12`), talking to the reader ("note that
   you…"), commented-out code, TODOs without a ticket.

```ts
// Rotating refresh tokens: a second concurrent refresh would present a revoked token,
// so every caller awaits the same in-flight promise.
let refreshing: Promise<boolean> | null = null
```

```ts
// Bad: restates the code.
// set page to 1
params.set("page", "1")
```

### In tests

Comment more than in production code, in layers: a header line with the journey covered, a
line on each `beforeEach` explaining the state it builds, and a line on any non-obvious wait,
selector or mock value. Do not comment every `expect`.

## Function spacing

- One-statement bodies: no blank lines inside.
- Longer bodies: at most one blank line between logical groups; never a blank line right after
  `{` of an `if`/`for`/`try`.

## Anti-patterns

- Portuguese route segments (`/voos/reservas`) or folder names. Paths are code.
- Mixed naming for the same concept (`booking` in one file, `reservation` in another).
- Invented abbreviations (`bkgSvc`).
- Default exports anywhere except pages (`index.tsx`) and layouts (`layouts/<Name>/index.tsx`).
