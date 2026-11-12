# 003 - Routing

## Purpose

How routes, layouts, guards and lazy loading fit together. React Router 7 in **declarative
mode** (`<BrowserRouter>`, `<Routes>`, `<Route>`). Import everything from `react-router`, never
`react-router-dom` (lint blocks it). Decided (AVG-6): the skeleton below is in place.

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
import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { GuestRoute, PrivateRoute } from '@/shared/auth';
import { loadAuthNamespace, loadLandingNamespace, loadPilotNamespace } from './i18n';
import PilotLayout from './layouts/PilotLayout';
import PublicLayout from './layouts/PublicLayout';

// Area namespaces load inside lazy(), so a page renders only when its strings exist.
const Home = lazy(() =>
  Promise.all([import('./pages/Home'), loadLandingNamespace()]).then(([page]) => page),
);
const Login = lazy(() =>
  Promise.all([import('./pages/Auth/Login'), loadAuthNamespace()]).then(([page]) => page),
);
const PilotHome = lazy(() =>
  Promise.all([import('./pages/Pilot/Home'), loadPilotNamespace()]).then(([page]) => page),
);
const NotFound = lazy(() => import('./pages/NotFound'));

export function PortalRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route element={<PilotLayout />}>
          <Route path="pilot" element={<PilotHome />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

New pages follow the same pattern: a permission-gated page nests in
`<Route element={<PermissionRoute permission="…" />}>` inside `PilotLayout`. Admin
(`src/admin/routes.tsx`) nests `PrivateRoute` → `AdminRoute` → `AdminLayout` → pages and `*`.

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
import { PORTAL_AUTH_CONFIG } from "./auth-config"
import { PortalRoutes } from "./routes"

applyInitialTheme() // sets data-airline / data-theme before first paint, no inline script

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProviders auth={PORTAL_AUTH_CONFIG}>
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

Decided (AVG-6). Guards live in `src/shared/auth/` (barrel `@/shared/auth`) and must not import
either entry. Each entry passes an `AuthConfig` to `AppProviders` in its `main.tsx`
(`src/<entry>/auth-config.ts`): `basename`, `homePath`, `loginPath`, `hasLoginRoute`,
`isOtherEntryPath`. All guards share one loading screen (`LoadingScreen` in
`src/shared/components/`, over the design system `BootScreen`).

```tsx
// src/shared/auth/PrivateRoute.tsx
export function PrivateRoute() {
  const { status } = useSession();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (status === 'guest') {
    return <LoginRedirect />; // buildLoginUrl(config, pathname + search)
  }

  return <Outlet />;
}
```

- `GuestRoute`: signed-in users go to `safeRedirect(searchParams.get("redirect"), homePath)`;
  a destination where `isOtherEntryPath()` is true (`/admin/*` from the portal) is loaded with
  `DocumentRedirect` (`window.location.replace`), never `<Navigate>`.
- `PermissionRoute permission scope? fallback?`: checks `can(permission, scope?)` (see 009).
  Without the permission it renders `fallback` or the shared `Forbidden` in place; it never
  redirects. A guest goes to the login.
- `AdminRoute`: `PermissionRoute` on `ADMIN_ACCESS_PERMISSION` with `<Forbidden hasPortalExit />`
  (a plain `<a href="/">`: `<Link to="/">` would resolve to `/admin/`). The permission name is
  a placeholder until the roles matrix (AVG-34).
- Until sign-in exists, `SessionProvider` is a **stub**: no API calls, always a guest unless a
  test passes `session` (see 013). Never add a fake login or a backdoor to switch it at runtime.

### Admin login (Decided (AVG-7))

Admin (`/admin/` on the app domain: `dev.flyavg.com/admin/`, `app.flyavg.com/admin/`) has no
login page; sign-in always goes through the portal. Its config has `hasLoginRoute: false`, so
`LoginRedirect` does a full-page `window.location.assign("/login?redirect=/admin/…")` through
`navigateToDocument` (`src/shared/lib/document-navigation.ts`). Inside `basename="/admin"` the
router's pathname has no prefix, so `buildLoginUrl` prepends `basename`. Slashes in `redirect`
stay readable; `?`, `&` and the rest are percent-encoded. After login, the portal
uses `navigate()` for portal paths and `window.location.assign()` for `/admin/*` paths (a
different HTML entry). Admin then boots its own session from the refresh cookie (see 009).
In the portal, `LoginRedirect` returns `<Navigate to="/login?redirect=…" replace />`.

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
