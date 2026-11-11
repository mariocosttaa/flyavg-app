# 007 - API client and data fetching

## Purpose

How the app talks to `flyavg-api`: a client generated from the API's OpenAPI document, wrapped
in TanStack Query hooks. Decision pending (AVG-7) for the libraries; the shape below is the
proposal.

## Stack

| Package | Role |
|---|---|
| `openapi-typescript` (dev) | Generates `paths` and `components` types from the OpenAPI JSON |
| `openapi-fetch` | Tiny typed `fetch` client over those types |
| `@tanstack/react-query` | Cache, loading/error state, retries, invalidation |

Nothing else talks to the API. No `axios`, no hand-written `fetch` in components, no
hand-written response types.

## Generating types

```jsonc
// package.json (scripts)
"api:types": "openapi-typescript $OPENAPI_URL -o src/shared/api/generated/schema.d.ts",
"api:types:check": "npm run api:types && git diff --exit-code src/shared/api/generated"
```

- `OPENAPI_URL` points at the published OpenAPI of the target API version (local API in dev).
  Where versions are fetched from (API URL vs a versioned artifact) is Decision pending (AVG-7).
- `generated/` is committed and never edited by hand. Regenerate it when the API version
  changes, in the same branch that adapts the app.
- CI runs `api:types:check` against the pinned API version, so drift fails the build.

## Client

```ts
// src/shared/api/client.ts
import createClient from "openapi-fetch"
import type { paths } from "./generated/schema"
import { env } from "@/shared/lib/env"
import { authFetch } from "@/shared/auth/auth-fetch"

export const api = createClient<paths>({ baseUrl: env.VITE_API_URL, fetch: authFetch })
```

`authFetch` adds the bearer token and handles 401 with a single refresh and one retry (see
009). Verify at AVG-7 how the installed `openapi-fetch` version calls a custom `fetch`
(Request object vs `(url, init)`), and clone the request before the first attempt so the body
can be resent.

## Errors

The API returns errors with a stable `code` (proposal: `{ statusCode, code, message,
details?: [{ field, code }] }`, to confirm with the API in AVG-7).

```ts
// src/shared/api/errors.ts
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly fieldErrors: ReadonlyArray<{ field: string; code: string }> = [],
  ) {
    super(code)
  }
}

export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error !== undefined || result.data === undefined) {
    throw toApiError(result.response.status, result.error)
  }
  return result.data
}
```

`toApiError` narrows `unknown` safely and falls back to `code: "UNKNOWN_ERROR"` (or
`NETWORK_ERROR` when `fetch` itself throws). UI shows `t(\`errors:${code}\`)` with a fallback
to `errors:UNKNOWN_ERROR` (see 011). The message from the API is never shown to users.

## Query keys

One factory per domain, in `query-keys.ts`. Keys are arrays that go from general to specific,
so invalidation can target a whole domain or one list.

```ts
// src/shared/api/query-keys.ts
export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (query: BookingListQuery) => [...bookingKeys.lists(), query] as const,
  detail: (bookingId: string) => [...bookingKeys.all, "detail", bookingId] as const,
}
```

## Query hooks

```ts
// src/shared/api/hooks/bookings.ts
import { keepPreviousData, skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { paths } from "../generated/schema"
import { api } from "../client"
import { unwrap } from "../errors"
import { bookingKeys } from "../query-keys"

export type BookingListQuery = NonNullable<paths["/bookings"]["get"]["parameters"]["query"]>

export function useBookings(query: BookingListQuery) {
  return useQuery({
    queryKey: bookingKeys.list(query),
    queryFn: async ({ signal }) => unwrap(await api.GET("/bookings", { params: { query }, signal })),
    // Keep the previous page on screen while the next one loads (no table flash).
    placeholderData: keepPreviousData,
  })
}

export function useBooking(bookingId: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId ?? ""),
    // skipToken keeps the query idle until the id exists, without a non-null assertion.
    queryFn: bookingId
      ? async ({ signal }) =>
          unwrap(await api.GET("/bookings/{bookingId}", { params: { path: { bookingId } }, signal }))
      : skipToken,
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CreateBookingBody) => unwrap(await api.POST("/bookings", { body })),
    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), booking)
      return queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
    },
  })
}
```

## QueryClient defaults

```ts
// src/shared/providers/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
})
```

4xx errors are not retried; 401 is already handled inside `authFetch`. On logout, call
`queryClient.clear()`.

## Rules

1. Hooks live in `src/shared/api/hooks/<domain>.ts`, named `use<Thing>` / `use<Verb><Thing>`.
2. Pass `signal` so React Query can cancel stale requests.
3. Mutations invalidate the narrowest keys that changed; prefer `setQueryData` for the
   detail you already have.
4. Optimistic updates only with rollback in `onError`, and only where latency hurts
   (toggles), not on forms.
5. No server state copied into `useState`. Derive from the query result.
6. Types come from `paths`/`components`. If a type is awkward, add an alias in the hook file,
   do not redefine the shape.
7. Auth endpoints (login, refresh, logout) use `credentials: "include"`; other calls do not
   need cookies.

## Anti-patterns

- `useEffect(() => { fetch(…).then(setData) }, [])`.
- `queryKey: ["bookings"]` for a paginated list (pages overwrite each other).
- Showing `error.message` from the API to users.
- `invalidateQueries()` with no key after every mutation.
