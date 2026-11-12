# 009 - Auth and session

## Purpose

How the app signs in, keeps the session, refreshes tokens, checks permissions and signs out.
The model is decided; endpoint names and payloads come from the API's OpenAPI document.

## Model

| Piece | Where it lives | Lifetime |
|---|---|---|
| Access token (JWT) | JavaScript memory only (module variable) | Short (minutes) |
| Refresh token | httpOnly, Secure, SameSite cookie set by the API, path-scoped to the refresh endpoint | Long, **rotated** on every refresh |
| Current user + permissions | `SessionProvider` state, loaded from `GET /me` | Until logout |

Never write either token to `localStorage`, `sessionStorage`, IndexedDB or a readable cookie.
Never log them.

## Token store

```ts
// src/shared/auth/token-store.ts
let accessToken: string | null = null
const listeners = new Set<() => void>()

export const tokenStore = {
  get: () => accessToken,
  set(token: string | null) {
    accessToken = token
    listeners.forEach((fn) => fn())
  },
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}
```

## Single-flight refresh

Refresh tokens rotate: the old one is revoked when a new one is issued. If two requests get a
401 at the same time and both call refresh, the second presents a revoked token and the user
is logged out. So **one refresh at a time**, shared by every caller.

```ts
// src/shared/auth/refresh.ts
let refreshing: Promise<boolean> | null = null

export function refreshSession(): Promise<boolean> {
  refreshing ??= doRefresh().finally(() => {
    refreshing = null
  })
  return refreshing
}

async function doRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${env.VITE_API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // the only call that needs the refresh cookie
    })
    if (!response.ok) return false
    const { accessToken } = (await response.json()) as { accessToken: string }
    tokenStore.set(accessToken)
    return true
  } catch {
    return false
  }
}
```

The refresh call uses plain `fetch`, not `api`, so it never goes through `authFetch` (no
recursion). Type the body from the generated schema once the endpoint exists.

## Auth-aware fetch: 401 → refresh once → retry once → logout

```ts
// src/shared/auth/auth-fetch.ts
const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"]

export async function authFetch(input: Request): Promise<Response> {
  const isAuthCall = AUTH_PATHS.some((path) => new URL(input.url).pathname.endsWith(path))
  const retry = input.clone() // body can be read only once; keep a copy for the retry
  const response = await fetch(withToken(input))
  // A 401 on login means wrong credentials: the form shows it, no refresh.
  if (response.status !== 401 || isAuthCall) return response

  const refreshed = await refreshSession()
  if (!refreshed) {
    sessionEvents.emit("expired")
    return response
  }
  const second = await fetch(withToken(retry))
  if (second.status === 401) sessionEvents.emit("expired")
  return second
}

function withToken(request: Request): Request {
  const token = tokenStore.get()
  if (!token) return request
  const headers = new Headers(request.headers)
  headers.set("Authorization", `Bearer ${token}`)
  return new Request(request, { headers })
}
```

- Exactly one retry per request. A second 401 means the session is gone.
- `sessionEvents.emit("expired")` makes `SessionProvider` clear the token, clear the query
  cache, show the `auth.session.expired` toast and send the user to the login (`buildLoginUrl`, 003) with the
  current path (see 003).
- When the client is first written, verify how the installed `openapi-fetch` passes requests
  to a custom `fetch`.

## Bootstrap

On page load the access token is gone (memory). `SessionProvider` starts in `loading`, calls
`refreshSession()` once, then `GET /me`. Guards render `BootScreen` until the status is
`authenticated` or `guest`.

```tsx
// src/shared/auth/SessionProvider.tsx (sketch)
type SessionState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authenticated"; user: CurrentUser }

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" })
  ...
  // On mount: refreshSession() → me() → authenticated, otherwise guest.
  // Subscribes to sessionEvents("expired") → guest + queryClient.clear().
  return <SessionContext value={{ ...state, signIn, signOut, can }}>{children}</SessionContext>
}

export function useSession() {
  const value = use(SessionContext)
  if (!value) throw new Error("useSession must be used inside SessionProvider")
  return value
}
```

Public pages (landing) do not wait for the bootstrap: only guarded routes do. The public
layout may show "Sign in" until the session resolves.

Multiple tabs: rotation means two tabs may refresh at once. Decided (AVG-7): the API accepts a
short grace window for parallel refreshes and returns the already-issued successor; reuse
outside it revokes the family. Use a `BroadcastChannel` ("flyavg-session") to share logout and
coordinate refresh, so tabs rarely rely on that window.

## Login and logout

- Login: `POST /auth/login` (credentials included so the API can set the refresh cookie) →
  store the access token → load `/me` → go to `safeRedirect(redirect, homePath)`: `navigate`
  with `replace` for portal paths, `window.location.replace` for `/admin/*` (another entry,
  see 003).
- Logout: `POST /auth/logout` (credentials included) → `tokenStore.set(null)` →
  `queryClient.clear()` → the login, built with `buildLoginUrl` from the entry's auth config (003). Clear local state even if the request fails.

## Permissions

Roles carry permissions with a **scope**: the whole group or one airline.

```ts
type Scope = { type: "group" } | { type: "airline"; airline: "taag" | "world" }

// Group-scoped grants cover every airline.
function can(permission: Permission, scope?: Scope): boolean
```

- Guards: `PermissionRoute permission="pilots.manage"` (see 003).
- In UI: hide or disable actions with `can()`. Hidden is the default; disable with a tooltip
  only when the user should know the action exists.
- The app check is for UX only. The API enforces every permission.
- Permission names come from the API (generated enum when available). Never invent strings.

## Security notes

- CORS and cookie flags are the API's job; the app only sends `credentials: "include"` to the
  auth endpoints.
- Decided (AVG-7): app and API are on the same site, so the refresh cookie is `SameSite=Strict`
  (`path=/auth`); the API also checks `Origin` on refresh and logout.
- Never put tokens in URLs, error reports or analytics.

## Tests

- Unit: concurrent 401s trigger exactly one refresh; second 401 emits `expired`; login 401 is
  not retried; `safeRedirect` cases (see 003).
- E2E: login → protected page → reload keeps the session → logout → protected page goes to
  login with `redirect`.
