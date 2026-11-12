# 013 - Testing

## Purpose

What to test, with which tool, and where the files go. Unit tests and e2e of critical flows are
mandatory and run in CI. Decided (AVG-6): the config below is in place.

## Stack

| Tool | Role |
|---|---|
| Vitest | Runner for unit and component tests (shares Vite config and the `@` alias) |
| jsdom | DOM for component tests |
| @testing-library/react + user-event + jest-dom | Render, interact like a user, matchers |
| MSW (Mock Service Worker) | Mocks the API at the network level, for tests and optional dev |
| Playwright | E2E in real browsers, Page Object Model |

## Where tests live

```text
src/shared/hooks/use-list-params.ts
src/shared/hooks/use-list-params.test.ts          ← next to the code
src/shared/design-system/components/Button/Button.test.tsx
src/portal/pages/Flights/Bookings/Bookings.test.tsx
src/test/
├── setup.ts               jest-dom, MSW server lifecycle, i18n init with pt resources
├── msw/
│   ├── server.ts          setupServer(...handlers)
│   └── handlers/          one file per domain: bookings.ts, auth.ts, pilots.ts
├── factories/             makeBooking(), makePilot(), makePage(items, meta)
└── render.tsx             renderWithProviders(ui, { route, session })
e2e/
├── tests/<area>/<journey>.spec.ts
├── pages/                 Page Objects (LoginPage.ts, BookingsPage.ts)
└── fixtures/              auth state, seeded data ids
```

No parallel `__tests__/` folders.

## Vitest config (sketch)

```ts
// vitest.config.ts
import { defineConfig, mergeConfig } from "vitest/config"
import viteConfig from "./vite.config"

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/shared/api/generated/**", "src/**/main.tsx", "src/catalog/**"],
    },
  },
}))
```

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest"
import { afterAll, afterEach, beforeAll } from "vitest"
import { server } from "./msw/server"

// Fail on any request without a handler, so missing mocks are visible.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

Decided (AVG-6): coverage is reported only (`npm run test:cov`), no thresholds yet; add them
once the first product screens land.

## MSW handlers use the generated types

```ts
// src/test/msw/handlers/bookings.ts
import { http, HttpResponse } from "msw"
import type { components } from "@/shared/api/generated/schema"
import { makeBooking, makePage } from "../../factories"

type BookingPage = components["schemas"]["BookingPage"]
const API = "http://api.test"

export const bookingHandlers = [
  http.get(`${API}/bookings`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") ?? 1)
    return HttpResponse.json<BookingPage>(makePage([makeBooking(), makeBooking()], { page }))
  }),
]
```

Override per test with `server.use(...)` for empty, error and edge cases.

## Component and page tests

```tsx
// src/portal/pages/Flights/Bookings/Bookings.test.tsx
// Bookings list: URL state, empty and error states.
describe("Bookings page", () => {
  it("resets page to 1 when the status filter changes", async () => {
    const user = userEvent.setup()
    const { router } = renderWithProviders(<Bookings />, { route: "/flights/bookings?page=3&search=fnc" })

    await user.selectOptions(await screen.findByRole("combobox", { name: "Estado" }), "open")

    expect(router.search()).toBe("?search=fnc&status=open")
  })

  it("shows the API error by code with a retry", async () => {
    // A code with its own translation, so the assertion proves the code-to-text mapping.
    server.use(http.get(`${API}/bookings`, () => HttpResponse.json({ code: "BOOKINGS_UNAVAILABLE" }, { status: 503 })))
    renderWithProviders(<Bookings />, { route: "/flights/bookings" })
    expect(await screen.findByRole("alert")).toHaveTextContent(/reservas/i)
  })
})
```

`renderWithProviders(ui, { route, basename, auth, session })` (`src/test/render.tsx`) wraps
`MemoryRouter` and `AppProviders` (auth config + session); i18n (`pt`) is initialised in
`setup.ts`. `session` switches the stub session (`makeSession(grants)` from
`src/test/factories/session.ts`, `{ status: "loading" }`, or guest by default); `auth` takes the
entry's config (`PORTAL_AUTH_CONFIG`, `ADMIN_AUTH_CONFIG`). The result's `currentLocation()`
reads the router location through `LocationProbe`, to assert redirects. Full page loads are
asserted by `vi.mock("@/shared/lib/document-navigation")`. QueryClient and ToastProvider join
the helper when they exist.

## Principles

1. Test behaviour, not implementation: what the user sees and does.
2. Query by role and accessible name first, then label, then text; `data-testid` only for
   skeletons and non-semantic regions.
3. `user-event`, not `fireEvent`. `findBy*` for anything async.
4. Mock at the boundary (network with MSW, time with fake timers). Do not mock child
   components or our own hooks.
5. Debounce tests use `vi.useFakeTimers({ shouldAdvanceTime: true })`.
6. Test names in en-US, describing behaviour (`"keeps filters in next page link"`).
7. Comments follow 001 (header line, setup lines, non-obvious mocks).

## What must have tests

| Change | Minimum |
|---|---|
| Hook or pure function | Unit tests incl. edge cases (`useListParams`, `safeRedirect`, formatters) |
| Design system component | Variants, keyboard, a11y name, disabled/loading |
| List page | URL state rules from 008, empty (both kinds), error, success |
| Form | Required errors, server field error, summary on 4xx/5xx, success path |
| Auth | Single-flight refresh, retry once, expiry, guard redirects |

## E2E (Playwright)

Critical flows, run in CI against the built app (`vite preview`) and a test API (seeded) or
MSW in the browser. Skill default: e2e in CI runs against MSW; a seeded test API is added
when the first full-stack flow needs it (ask the user then).

Critical flows to cover first:

1. Login → protected page → reload keeps the session → logout.
2. Expired session mid-use → redirected to login with `redirect` → back to the same page.
3. Bookings list: search, filter, paginate, reload keeps state, back button restores.
4. Create a booking (form validation + success).
5. Theme and language switch persist across reload.
6. Admin: a pilot without admin permission cannot open `/admin/`.

```ts
// e2e/pages/BookingsPage.ts
export class BookingsPage {
  constructor(private readonly page: Page) {}
  readonly search = () => this.page.getByRole("searchbox")
  readonly nextPage = () => this.page.getByRole("link", { name: /seguinte/i })
  async goto(query = "") { await this.page.goto(`/flights/bookings${query}`) }
}
```

Projects: Chromium and WebKit desktop, plus one mobile viewport. Traces and screenshots on
failure. Locale `pt-PT`, timezone `UTC`.

## Anti-patterns

- Snapshot tests of whole pages.
- Tests that pass without the change being tested (assert the behaviour that changed).
- `waitFor(() => …, { timeout: 5000 })` to hide real races.
- Real network in unit tests.
