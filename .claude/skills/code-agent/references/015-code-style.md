# Code style: code that reads as written by a careful person

FlyAVG code must look like a thoughtful developer wrote it: real names, one idea per line, blank lines between steps, shallow nesting. Lint enforces most of it; the rest is on you and on review.

The rules live in `eslint.code-style.mjs`, **identical in flyavg-api and flyavg-app**, wired into `eslint.config.js`. Change both files or neither. Formatting is Prettier (`.prettierrc`) and `.editorconfig`, also identical in both repos.

## Formatting (Prettier, never by hand)

| Setting | Value |
|---|---|
| Semicolons | yes |
| Quotes | single (JSX attributes use double, Prettier's default) |
| Trailing commas | everywhere |
| Line width | 100 |
| Indent | 2 spaces |
| Line endings | LF |

Run `npm run format` before committing; `npm run format:check` must pass. Never fight Prettier with manual alignment.

## Names say what the thing is

- **No abbreviations** (`unicorn/prevent-abbreviations`): `request` not `req`, `response` not `res`, `error` not `err` or `e`, `context` not `ctx`, `directory` not `dir`, `index` not `idx`, `element` not `el`, `event` not `evt`, `value` not `val`.
  Allowed because they are the stack's established names: `args`, `db`, `dto`/`Dto`, `e2e`, `env`, `i18n`, `params`, `props`, `ref`/`refs`.
- **At least two characters** (`id-length`), except `_` (ignored), `i`/`j` (loop counters), `x`/`y`/`z` (coordinates) and `t` (the i18n function).
- **No meaningless names** (`id-denylist`): `tmp`, `temp`, `foo`, `bar`, `baz`, `obj`, `stuff`, `thing`, `dummy`, `asdf`.
- **Booleans read as questions** (`naming-convention`): `isActive`, `hasRoutes`, `canBook`, `shouldNotify`, `wasCancelled`, `needsReview`, `allowsCharter`.
- **Casing**: `camelCase` for variables and functions, `PascalCase` for types, classes, React components and enum members, `UPPER_CASE` only for true constants. Object keys follow their external contract (headers, env vars, payloads). Destructured keys keep their source name (`const { CORS_ORIGINS } = ...`).
- A caught error is always `error` (`unicorn/catch-error-name`).
- Prefer domain words over technical ones: `pilot`, `booking`, `route`, `callsign`, `airline` instead of `item`, `entry`, `record`, `info`, `data` when the domain word exists.

```ts
// Bad
const res = await svc.get(id);
const flg = res.items.filter((r) => r.st === 'A').length > 0;

// Good
const routes = await fetchAirlineRoutes(airlineId);
const hasActiveRoutes = routes.items.some((route) => route.status === 'active');
```

## Spacing between steps

A function is a short story: gather, decide, act, return. Separate the steps with one blank line (`@stylistic/padding-line-between-statements`):

- a blank line after a group of `const`/`let` declarations;
- a blank line before and after `if`, `for`, `while`, `try`, `switch` blocks;
- a blank line before `return` (unless it is the only statement);
- a blank line between class members (single-line fields may stay together).

```ts
async bookFlight(pilotId: string, routeId: string): Promise<Booking> {
  const pilot = await this.pilotsService.findActive(pilotId);
  const route = await this.routesService.findBookable(routeId);

  if (!route.allowsRank(pilot.rank)) {
    throw new ApiException(BookingErrors.RANK_TOO_LOW);
  }

  const booking = this.bookingsRepository.create({ pilot, route, status: 'booked' });

  return this.bookingsRepository.save(booking);
}
```

Never more than one blank line in a row; never a blank line right after an opening brace.

## Control flow that reads top to bottom

- Braces on every `if`, even one-liners (`curly`).
- Early returns instead of `else` after `return` (`no-else-return`), no lonely `if` inside `else` (`no-lonely-if`).
- No nested ternaries (`no-nested-ternary`): use `if`, a lookup object or a small function.
- At most 3 levels of nesting (`max-depth`), 4 parameters (`max-params`, use an options object beyond that), complexity 15 (`complexity`). Hitting a limit means: extract a well-named function.
- `===` always, `const` by default, template literals over concatenation, object shorthand, no `var`.
- No `console` (use the logger). The single exception is the env bootstrap, marked with a disable comment and the reason.
- Type-only imports use `import type` (`consistent-type-imports`).

## Comments

- Explain **why**, never what the next line obviously does.
- One space after `//` (`@stylistic/spaced-comment`). Full sentences, English.
- No commented-out code, no ticket codes, no `TODO` without an owner task (`TODO(AVG-12): ...`).

## React specifics

- Components and their files: `PascalCase` (`BookingCard.tsx`, `function BookingCard()`). Hooks: `useX` in camelCase (`useListParams`).
- Event handlers are `handleX` inside the component and `onX` as props: `<RouteFilters onSearchChange={handleSearchChange} />`.
- Boolean props read as questions too: `isLoading`, `hasError`, `canEdit`, never `loading` or `disabled2`.
- A component does one thing; a long JSX block becomes a named part in `parts/` (004), never an anonymous inner render function.
- No literal user-facing text in JSX: it goes through i18n (011). Lint blocks it.

## When lint is wrong

Rare. Disable on the line, never the file, and say why on the same comment:

```ts
// eslint-disable-next-line no-console -- logger does not exist before env validation
console.error('Invalid environment', issues);
```

A disable without a reason is a review finding.
