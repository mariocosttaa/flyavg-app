# 004 - Pages and parts

## Purpose

How a page folder is organised, what goes in `index.tsx`, `parts/` and `skeleton.tsx`, and how
sub-routes nest.

## Folder per page

```text
src/portal/pages/Flights/Bookings/
├── index.tsx              Page: default export Bookings
├── skeleton.tsx           Optional: BookingsSkeleton for first load
├── parts/
│   ├── BookingsTable.tsx
│   ├── BookingsFilters.tsx
│   ├── BookingStatusBadge.tsx
│   └── BookingsEmpty.tsx
├── Bookings.test.tsx      Page-level test (URL state, empty, error)
├── new/
│   ├── index.tsx          Page: default export NewBooking
│   └── parts/
│       └── BookingForm.tsx
└── edit/
    ├── index.tsx          Page: default export EditBooking (reads :bookingId)
    └── parts/
        └── EditBookingForm.tsx
```

Rules:

1. `index.tsx` has exactly one default export: the page component, named after the folder.
2. `parts/` holds components used **only** by this page (or its sub-routes). They use named
   exports. No `index.ts` barrel inside `parts/`.
3. A part that a second page needs moves up (see 002, "What goes where").
4. Sub-routes are subfolders. `new/` and `edit/` may import from `../parts/` (the parent's);
   the reverse is not allowed.
5. `skeleton.tsx` exports a named `<PageName>Skeleton` built from design system `Skeleton`
   pieces with the same layout as the loaded page.
6. Pages contain no `fetch`, no API types written by hand and no hardcoded strings.

## What a page does

A page **composes**: reads route and URL state, calls query hooks, and chooses between
loading, error, empty and content. Heavy markup goes to `parts/`.

```tsx
// src/portal/pages/Flights/Bookings/index.tsx
import { useTranslation } from "react-i18next"
import { PageHeader, Button } from "@/shared/design-system/components"
import { ListPagination } from "@/shared/components/ListPagination"
import { useBookings } from "@/shared/api/hooks/bookings"
import { useListParams } from "@/shared/hooks/use-list-params"
import { usePageTitle } from "@/shared/hooks/use-page-title"
import { QueryError } from "@/shared/components/QueryError"
import { BookingsFilters } from "./parts/BookingsFilters"
import { BookingsTable } from "./parts/BookingsTable"
import { BookingsEmpty } from "./parts/BookingsEmpty"
import { BookingsSkeleton } from "./skeleton"

export default function Bookings() {
  const { t } = useTranslation("flights")
  usePageTitle(t("bookings.title"))

  const list = useListParams({ filters: ["status", "airline"], sort: ["-departureAt", "departureAt"] })
  const bookings = useBookings(list.query)

  return (
    <>
      <PageHeader
        title={t("bookings.title")}
        actions={<Button as="link" to="new">{t("bookings.new")}</Button>}
      />
      <BookingsFilters list={list} />

      {bookings.isPending && <BookingsSkeleton />}
      {bookings.isError && <QueryError error={bookings.error} onRetry={bookings.refetch} />}
      {bookings.isSuccess && bookings.data.items.length === 0 && (
        <BookingsEmpty hasFilters={list.hasActiveFilters} onClear={list.clear} />
      )}
      {bookings.isSuccess && bookings.data.items.length > 0 && (
        <>
          <BookingsTable items={bookings.data.items} sort={list.sort} onSort={list.setSort} />
          <ListPagination meta={bookings.data.meta} />
        </>
      )}
    </>
  )
}
```

The `Button as="link"` API is a proposal for the design system (Decision pending (AVG-5)).

## Parts

```tsx
// src/portal/pages/Flights/Bookings/parts/BookingStatusBadge.tsx
import { useTranslation } from "react-i18next"
import { Badge } from "@/shared/design-system/components"
import type { components } from "@/shared/api/generated/schema"

type BookingStatus = components["schemas"]["BookingStatus"]

const TONE: Record<BookingStatus, "neutral" | "info" | "success" | "danger"> = {
  open: "info",
  flown: "success",
  cancelled: "danger",
  expired: "neutral",
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useTranslation("flights")
  return <Badge tone={TONE[status]}>{t(`bookings.status.${status}`)}</Badge>
}
```

A `Record` over the API enum makes the compiler fail when the API adds a status, which is
the point.

## Skeleton

```tsx
// src/portal/pages/Flights/Bookings/skeleton.tsx
import { Skeleton, TableSkeleton } from "@/shared/design-system/components"

export function BookingsSkeleton() {
  return (
    <div data-testid="bookings-skeleton">
      <Skeleton variant="toolbar" />
      <TableSkeleton rows={8} columns={5} />
    </div>
  )
}
```

The skeleton is reused as the route `Suspense` fallback only when the layout does not provide
a generic one. Skeletons have `aria-hidden` content and the container has
`aria-busy="true"` (see 012).

## Sub-route pages

```tsx
// src/portal/pages/Flights/Bookings/edit/index.tsx
export default function EditBooking() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const booking = useBooking(bookingId)
  ...
}
```

The route is `flights/bookings/:bookingId/edit` in `routes.tsx`. When `bookingId` is missing
or the API returns 404 (`code: "BOOKING_NOT_FOUND"`), render the `NotFound` content in place.

## Admin pages

Same convention under `src/admin/pages/`. Admin pages use the dense layout variants
(`density="compact"` on `Table`, `Form`), not different components. Example:
`src/admin/pages/Pilots/index.tsx`, `src/admin/pages/Pilots/edit/index.tsx`.

## Anti-patterns

- A 400-line `index.tsx` with table, filters and form inline.
- A `parts/` component imported by another page "just this once".
- `useEffect` + `useState` to load data in a page (use the query hooks).
- Page-specific hooks in `src/shared/hooks/`. Put them in `parts/` (`parts/use-booking-form.ts`).
