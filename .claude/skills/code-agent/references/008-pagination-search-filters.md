# 008 - Pagination, search and filters in the URL

## Purpose

Every list screen (portal and admin) keeps its state in the URL, so it survives reload, back
button and sharing a link. One hook parses it, one component paginates. Decision pending
(AVG-6) for the exact hook API.

## API contract

Request query: `page` (1-based), `limit` (default 20, max 100), `search`, `sort`
(`field` or `-field` for descending, to confirm in AVG-7), plus named filters.

Response:

```ts
{ items: T[], meta: { page, limit, total, totalPages, hasNextPage, hasPreviousPage } }
```

## Rules

1. `page`, `limit`, `search`, `sort` and filters live in `URLSearchParams`. Never only in
   `useState`.
2. Parse defensively: `page` must be an integer ≥ 1, `limit` an integer in 1–100 (anything
   else falls back to the default), `sort` and filter values must be in an allow-list.
   Invalid values are ignored, not sent to the API.
3. Default values are **omitted** from the URL (`page=1`, `limit=20`, empty search).
4. Changing `search`, `sort`, `limit` or any filter **deletes `page`** (back to 1).
5. Search input is debounced (300 ms) and written with `{ replace: true }` so typing does not
   flood history. Filters, sort and page changes push a new entry.
6. Prev/next links are built from the **current** params; only `page` changes.
7. If `page > totalPages` (and `totalPages > 0`), replace the URL with the last page.
8. The query key includes the parsed params; the list hook uses `placeholderData:
   keepPreviousData` (see 007).
9. Scroll does not reset on a params-only change; focus moves to the results heading after a
   page change for screen reader users.

## Hook

```ts
// src/shared/hooks/use-list-params.ts
import { useSearchParams } from "react-router"

export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

type Options<F extends string, S extends string> = {
  filters?: readonly F[]
  sort?: readonly S[]          // allow-list, e.g. ["departureAt", "-departureAt"]
  defaultSort?: S
}

export function useListParams<F extends string = never, S extends string = string>(options: Options<F, S> = {}) {
  const [params, setParams] = useSearchParams()

  const page = parsePositiveInt(params.get("page")) ?? 1
  const rawLimit = parsePositiveInt(params.get("limit"))
  const limit = rawLimit && rawLimit <= MAX_LIMIT ? rawLimit : DEFAULT_LIMIT
  const search = params.get("search")?.trim() ?? ""
  const rawSort = params.get("sort")
  const sort = options.sort?.find((s) => s === rawSort) ?? options.defaultSort
  const filters = Object.fromEntries(
    (options.filters ?? []).flatMap((name) => {
      const value = params.get(name)
      return value ? [[name, value]] : []
    }),
  ) as Partial<Record<F, string>>

  function update(changes: Record<string, string | null>, { resetPage = true, replace = false } = {}) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(key)
        else next.set(key, value)
      }
      if (resetPage) next.delete("page")
      return next
    }, { replace })
  }

  return {
    page,
    limit,
    search,
    sort,
    filters,
    hasActiveFilters: search !== "" || Object.keys(filters).length > 0,
    query: { page, limit, ...(search && { search }), ...(sort && { sort }), ...filters },
    setSearch: (value: string) => update({ search: value.trim() || null }, { replace: true }),
    setFilter: (name: F, value: string | null) => update({ [name]: value }),
    setSort: (value: S | null) => update({ sort: value === options.defaultSort ? null : value }),
    setLimit: (value: number) => update({ limit: value === DEFAULT_LIMIT ? null : String(value) }),
    clear: () => update(Object.fromEntries([...(options.filters ?? []), "search"].map((k) => [k, null]))),
  }
}

function parsePositiveInt(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null
  const n = Number(value)
  return n >= 1 && Number.isSafeInteger(n) ? n : null
}
```

`query` must satisfy the endpoint's generated query type; map names in the domain hook if needed.

## Debounced search input

```tsx
// src/shared/components/ListSearch.tsx
export function ListSearch({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const [draft, setDraft] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  const commit = useDebouncedCallback(onChange, 300) // cancels on unmount

  // URL changed from outside (back button, clear filters): adjust state during render,
  // keeping a trailing space the user is still typing.
  if (value !== lastValue) {
    setLastValue(value)
    if (value !== draft.trim()) setDraft(value)
  }

  return (
    <SearchField
      label={label}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value)
        commit(e.target.value)
      }}
    />
  )
}
```

`useDebouncedCallback` lives in `src/shared/hooks/`. No effect syncs props to state and no
lint rule is disabled.

## Pagination component

Contract: receives `meta` from the API, renders links (not buttons) so pages are real URLs,
keeps every other param.

```tsx
// src/shared/design-system/components/Pagination/Pagination.tsx
type PaginationProps = {
  meta: { page: number; totalPages: number; total: number; hasNextPage: boolean; hasPreviousPage: boolean }
  labels: { nav: string; previous: string; next: string; status: string } // translated by caller
  hrefForPage: (page: number) => string
}

export function Pagination({ meta, labels, hrefForPage }: PaginationProps) {
  if (meta.totalPages <= 1) return null
  return (
    <nav aria-label={labels.nav} className="flex items-center justify-between gap-4">
      <PageLink to={hrefForPage(meta.page - 1)} disabled={!meta.hasPreviousPage} rel="prev" label={labels.previous} icon="chevron-left" />
      <p aria-live="polite" className="text-sm text-fg-muted tabular-nums">{labels.status}</p>
      <PageLink to={hrefForPage(meta.page + 1)} disabled={!meta.hasNextPage} rel="next" label={labels.next} icon="chevron-right" />
    </nav>
  )
}
```

The design system stays router-agnostic and string-free. A shared wrapper provides the URL
logic and translations:

```tsx
// src/shared/components/ListPagination.tsx
export function ListPagination({ meta }: { meta: PageMeta }) {
  const { t } = useTranslation("common")
  const [params] = useSearchParams()
  const { pathname } = useLocation()

  function hrefForPage(page: number) {
    const next = new URLSearchParams(params)
    if (page <= 1) next.delete("page")
    else next.set("page", String(page))
    const qs = next.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <Pagination
      meta={meta}
      hrefForPage={hrefForPage}
      labels={{
        nav: t("pagination.label"),
        previous: t("pagination.previous"),
        next: t("pagination.next"),
        status: t("pagination.status", { page: meta.page, totalPages: meta.totalPages, count: meta.total }),
      }}
    />
  )
}
```

## Out-of-range page

```ts
// In the page, after the query succeeds.
useEffect(() => {
  const meta = bookings.data?.meta
  if (meta && meta.totalPages > 0 && meta.page > meta.totalPages) {
    setParams((p) => {
      const next = new URLSearchParams(p)
      next.set("page", String(meta.totalPages))
      return next
    }, { replace: true })
  }
}, [bookings.data?.meta])
```

Move it to `useClampPage(meta)` in `src/shared/hooks/` when a second list needs it.

## Tests required for every list screen

- Reload with `?page=2&status=open` shows page 2, filter applied.
- Typing a search updates the URL once after the debounce and removes `page`.
- Changing a filter removes `page` and keeps `search`.
- Next link keeps `search`, `sort` and filters.
- `?page=abc` and `?limit=500` fall back to defaults without an API error.

## Anti-patterns

- `<Link to={\`?page=${page + 1}\`}>`: drops every other param.
- Keeping page in state and filters in the URL (or the reverse).
- Firing an API request per keystroke.
