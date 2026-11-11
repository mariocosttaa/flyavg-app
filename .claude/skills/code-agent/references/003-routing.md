# 003 - Routing

## Purpose

How routes, layouts, guards and lazy loading fit together. React Router 7 in **declarative
mode** (`<BrowserRouter>`, `<Routes>`, `<Route>`). Import everything from `react-router`, never
`react-router-dom`. Decision pending (AVG-6) for the router skeleton.

## Rules

1. One routes file per entry: `src/portal/routes.tsx`, `src/admin/routes.tsx`. No routes
   declared inside pages.
2. Every page is loaded with `React.lazy()`. No page is imported statically. The `lazy` prop on
   `<Route>` belongs to data mode and is not used here.
3. Each layout wraps its `<Outlet />` in `<Suspense>` with a skeleton fallback, so the frame
   (top bar, sidebar) stays visible while the page chunk loads.
4. Guards are **pathless layout routes** that render `<Outlet />` or `<Navigate replace />`.
5. URL segments are English kebab-case. Dynamic segments are named for the entity:
   `:bookingId`, not `:id`, when more than one id can appear.
6. Every routes tree ends with `path="*"` → `NotFound`.
7. Path strings live in one `paths.ts` per entry, so links and redirects never drift.

## Portal routes (sketch)

```tsx
// src/portal/routes.tsx
import { lazy } from "react"
import { Route, Routes } from "react-router"
import { GuestRoute, PermissionRoute, PrivateRoute } from "@/shared/auth"
import PublicLayout from "./layouts/PublicLayout"
import PilotLayout from "./layouts/PilotLayout"

const Landing = lazy(() => import("./pages/Landing"))
const Login = lazy(() => import("./pages/Auth/Login"))
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"))
const Bookings = lazy(() => import("./pages/Flights/Bookings"))
const NewBooking = lazy(() => import("./pages/Flights/Bookings/new"))
const Logbook = lazy(() => import("./pages/Pilot/Logbook"))
const NotFound = lazy(() => import("./pages/NotFound"))

export function PortalRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<PilotLayout />}>
          <Route path="flights/bookings" element={<Bookings />} />
          <Route element={<PermissionRoute permission="bookings.create" />}>
            <Route path="flights/bookings/new" element={<NewBooking />} />
          </Route>
          <Route path="pilot/logbook" element={<Logbook />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

Layouts are imported statically because they are small and shared by many routes. If a layout
grows heavy (maps later with MapLibre GL), lazy-load the heavy part inside it, not the frame.

## Entry boot (sketch)

```tsx
// src/portal/main.tsx
import "@/shared/design-system/index.css"
import { applyInitialTheme } from "@/shared/design-system/theme"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import { AppProviders } from "@/shared/providers/AppProviders"
import { PortalRoutes } from "./routes"

applyInitialTheme() // sets data-airline / data-theme before first paint, no inline script

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders auth={portalAuthConfig}>
        <PortalRoutes />
      </AppProviders>
    </BrowserRouter>
  </StrictMode>,
)
```

The `!` on `getElementById` is the one accepted non-null assertion (the element is in our own
HTML). Admin's `main.tsx` is the same with `<BrowserRouter basename="/admin">`.

## Layout with Suspense

```tsx
// src/portal/layouts/PilotLayout/index.tsx
export default function PilotLayout() {
  return (
    <AppFrame sidebar={<PilotSidebar />} topBar={<PilotTopBar />}>
      <RouteErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </RouteErrorBoundary>
    </AppFrame>
  )
}
```

`RouteErrorBoundary` resets on location change (key it by `location.pathname`). See 012.

## Guards

Guards live in `src/shared/auth/` and must not import either entry. Each entry passes its own
paths through an `AuthConfigProvider` (`loginUrl`, `homePath`), set in its `main.tsx`. All
guards share one loading screen (`BootScreen` from the design system), not a copy each.

```tsx
// src/shared/auth/PrivateRoute.tsx
export function PrivateRoute() {
  const { status } = useSession()
  const { goToLogin } = useAuthConfig()
  const location = useLocation()

  if (status === "loading") return <BootScreen />
  if (status === "guest") return goToLogin(location.pathname + location.search)
  return <Outlet />
}
```

- `GuestRoute`: signed-in users go to `safeRedirect(searchParams.get("redirect"), homePath)`.
- `PermissionRoute`: checks `can(permission, scope?)` from the session (see 009). Without the
  permission it renders the `Forbidden` page in place, it does not redirect.
- Admin `AdminRoute`: requires any admin permission. A pilot without one sees `Forbidden` with
  a link back to the portal.

### Admin login (Decision pending (AVG-7))

Proposal: admin has no login page. Its `goToLogin` does a full-page
`window.location.assign("/login?redirect=/admin/…")` to the portal. After login, the portal
uses `navigate()` for portal paths and `window.location.assign()` for `/admin/*` paths (a
different HTML entry). Admin then boots its own session from the refresh cookie (see 009).
The portal `goToLogin` returns `<Navigate to="/login?redirect=…" replace />`.

## Safe redirect after login

Only same-origin paths are accepted. Everything else falls back to the entry's home path.
Parse with `URL`, not string prefixes: browsers strip tabs and newlines, so `"/\t/evil.com"`
passes a prefix check and becomes `//evil.com`.

```ts
// src/shared/lib/safe-redirect.ts
export function safeRedirect(value: string | null, fallback: string): string {
  if (!value || !value.startsWith("/")) return fallback
  try {
    const url = new URL(value, window.location.origin)
    // Anything that resolves to another origin is an open redirect.
    if (url.origin !== window.location.origin) return fallback
    return url.pathname + url.search + url.hash
  } catch {
    return fallback
  }
}
```

Test it with `https://x`, `//x`, `/\\x`, `/\t/x`, `javascript:…`, empty, `/admin/pilots` and a
valid portal path.

## Links and navigation

- `<Link>` / `<NavLink>` for navigation, never `<a href>` to internal routes.
- `useNavigate()` only after an action (submit, delete). Use `{ replace: true }` when the
  previous URL should not stay in history (after login, after a URL normalisation).
- Active state in menus comes from `NavLink`'s `aria-current="page"`, styled via tokens.

## Scroll and titles

- A `ScrollToTop` component in each layout resets scroll on pathname change (not on search
  param change, so pagination does not jump).
- Each page sets `document.title` through a `usePageTitle(t("flights.bookings.title"))` hook.
  Public pages get full meta tags when prerendering lands (see 014).

## Anti-patterns

- Static imports of pages in `routes.tsx` (kills code splitting).
- Guards copy-pasting their own spinner and translated "loading" text.
- `navigate(searchParams.get("redirect"))` without `safeRedirect`.
- A route defined in admin and portal at the same time "for convenience".
