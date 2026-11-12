# 012 - Errors, loading and empty states

## Purpose

Every screen that waits for something shows a clear state: loading, empty, error or content.
This file says which component to use for each and how errors flow.

## The four states

| State | Component | Notes |
|---|---|---|
| Boot (session unknown) | `BootScreen` | Only guards and entry boot use it |
| Route chunk loading | Layout `Suspense` fallback (`PageSkeleton`) | Frame stays visible |
| Data loading (first time) | Page `skeleton.tsx` | Same layout as the content |
| Data refreshing (new page, filter) | Keep previous data + subtle `aria-busy` on the region | No skeleton flash |
| Empty | `EmptyState` | Different copy for "no data yet" vs "no results for these filters" |
| Error (query) | `QueryError` | Translated by code, with retry |
| Error (render crash) | `RouteErrorBoundary` | Per layout, resets on navigation |
| Not found / forbidden | `NotFound`, `Forbidden` pages | Rendered in place |

## Loading

- Skeletons mirror the final layout (same rows, columns, header). Avoid spinners for content
  areas; a spinner is for buttons (`Button loading`) and tiny inline waits.
- The loading region has `aria-busy="true"`; skeleton shapes are `aria-hidden`.
- Do not show a skeleton for very short loads: React Query's `placeholderData` and Suspense
  transitions already avoid flicker. No artificial delays.

## Empty

```tsx
// src/portal/pages/Flights/Bookings/parts/BookingsEmpty.tsx
export function BookingsEmpty({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  const { t } = useTranslation("flights")
  if (hasFilters) {
    return (
      <EmptyState
        title={t("bookings.noResultsTitle")}
        body={t("bookings.noResultsBody")}
        action={<Button variant="secondary" onClick={onClear}>{t("common:actions.clearFilters")}</Button>}
      />
    )
  }
  return (
    <EmptyState
      icon="plane"
      title={t("bookings.emptyTitle")}
      body={t("bookings.emptyBody")}
      action={<Button as="link" to="new">{t("bookings.new")}</Button>}
    />
  )
}
```

## Query errors

```tsx
// src/shared/components/QueryError.tsx
export function QueryError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation("errors")
  const code = error instanceof ApiError ? error.code : "UNKNOWN_ERROR"
  return (
    <Alert tone="danger" role="alert" title={t("loadFailedTitle")}>
      <p>{t(code, { defaultValue: t("UNKNOWN_ERROR") })}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>{t("common:actions.retry")}</Button>}
    </Alert>
  )
}
```

- 403 → `Forbidden` content in place. 404 on a detail → `NotFound` content in place.
- 401 never reaches the UI: `authFetch` handles it (see 009).
- Network errors use `errors:NETWORK_ERROR` ("check your connection").

## Mutation feedback: own Toast

`Toast` is a design system component with a `ToastProvider` and `useToast()`:

```ts
const toast = useToast()
toast.success(t("bookings.cancelled"))
toast.error(t(`errors:${code}`))
```

- Success: brief confirmation after an action that changes data.
- Error outside forms: toast only. Inside forms: summary + toast (see 010).
- Toasts live in a region with `role="status"` (success/info) or `role="alert"` (error), are
  dismissible, pause on hover/focus, and never carry the only path to an action.
- No toast library: it is ours (see 006).

## Error boundaries

React 19 still needs a class component for boundaries. One shared `ErrorBoundary` in
`src/shared/components/`, used by:

- each layout around its `<Outlet />` (`RouteErrorBoundary`, keyed by pathname so it resets on
  navigation),
- risky widgets that should fail alone (the map, later).

```tsx
// src/shared/components/RouteErrorBoundary.tsx
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return <ErrorBoundary key={pathname} fallback={<CrashScreen />}>{children}</ErrorBoundary>
}
```

`CrashScreen` shows a translated message, a "reload" button and a "go to home" link. It never
shows the stack trace. Errors are reported to Sentry (`@sentry/react`, Decided (AVG-7), wired
in AVG-3, active only when `VITE_ERROR_TRACKING_DSN` is set), without tokens or personal data.

Chunk load errors after a deploy (old `index.html` referencing removed assets) are caught by
the boundary; `CrashScreen` offers a reload, which fetches the new build.

## Rules

1. Every query-driven view handles `isPending`, `isError`, empty and success explicitly.
2. No empty `catch {}`. Either handle (show, map, retry) or rethrow; a comment says why if the
   error is intentionally ignored.
3. No `console.log` left behind. `console.error` only inside the error reporter.
4. Destructive actions use a confirm `Dialog` with the object name in the text.
5. Never show raw API messages, status codes or stack traces to users.

## Tests

For each list or detail page: loading (skeleton test id), empty (both variants for lists),
error (MSW returns 500 → `QueryError` with retry works), success.
