# 010 - Forms and validation

## Purpose

One pattern for every form: zod schema, react-hook-form, own `Field` components, and API errors
mapped to fields or to a form summary.

## Stack

| Package | Role |
|---|---|
| `zod` | Schema: rules and inferred type (also used for env, see 014) |
| `react-hook-form` | Field state, validation timing, submit |
| `@hookform/resolvers` | `zodResolver(schema)` |

The client validates for UX. The API validates again and is the source of truth.

## Messages are i18n keys

Zod messages are **keys**, not text. The `Field` component translates them. This keeps
Portuguese out of `.ts` files and lets the language switch without rebuilding schemas.

```ts
// src/portal/pages/Flights/Bookings/new/parts/booking-schema.ts
import { z } from "zod"

export const bookingSchema = z.object({
  flightId: z.string().min(1, "validation.required"),
  aircraftId: z.string().min(1, "validation.required"),
  departureAt: z.iso.datetime({ message: "validation.dateTime" }),
  remarks: z.string().max(500, "validation.maxLength").optional(),
})

export type BookingValues = z.infer<typeof bookingSchema>
```

Validation keys live in the `common` namespace (`common:validation.required`). Parameters such
as `max` are passed by the `Field` when it knows them; keep messages generic otherwise. Check
zod 4 is installed: use `z.iso.datetime()` (not `z.string().datetime()`).

## Canonical form

```tsx
// src/portal/pages/Flights/Bookings/new/parts/BookingForm.tsx
export function BookingForm() {
  const { t } = useTranslation("flights")
  const navigate = useNavigate()
  const toast = useToast()
  const createBooking = useCreateBooking()
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { flightId: "", aircraftId: "", departureAt: "", remarks: "" },
  })

  async function onSubmit(values: BookingValues) {
    try {
      const booking = await createBooking.mutateAsync(values)
      toast.success(t("bookings.created"))
      navigate(`/flights/bookings/${booking.id}`)
    } catch (error) {
      applyServerErrors(error, form.setError)
    }
  }

  return (
    <Form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FormErrorSummary error={form.formState.errors.root?.server} />
      <Field label={t("bookings.form.flight")} error={form.formState.errors.flightId}>
        <FlightPicker {...form.register("flightId")} />
      </Field>
      <Field label={t("bookings.form.departureAt")} error={form.formState.errors.departureAt}>
        <DateTimeInput {...form.register("departureAt")} />
      </Field>
      <Field label={t("bookings.form.remarks")} error={form.formState.errors.remarks} optional>
        <Textarea {...form.register("remarks")} />
      </Field>
      <FormActions>
        <Button variant="secondary" onClick={() => navigate(-1)}>{t("common:actions.cancel")}</Button>
        <Button type="submit" loading={form.formState.isSubmitting}>{t("bookings.form.submit")}</Button>
      </FormActions>
    </Form>
  )
}
```

## Server errors

```ts
// src/shared/forms/apply-server-errors.ts
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>) {
  if (error instanceof ApiError && error.fieldErrors.length > 0) {
    for (const { field, code } of error.fieldErrors) {
      setError(field as Path<T>, { type: "server", message: `errors:${code}` })
    }
    return
  }
  const code = error instanceof ApiError ? error.code : "UNKNOWN_ERROR"
  setError("root.server", { type: "server", message: `errors:${code}` })
}
```

- Field errors from the API go next to their field.
- Other errors (conflict, forbidden, network) go to `FormErrorSummary` at the top of the form
  (`role="alert"`, focused on submit failure) **and** a toast. The summary stays after the
  toast disappears.
- Outside forms (confirm dialogs, row actions), errors are toast-only.
- The `field` names from the API must match form field names; map them in the hook if not.

## Field component contract

- Renders `<label>`, the control, optional hint and the translated error.
- Wires `id`, `htmlFor`, `aria-describedby` (hint + error) and `aria-invalid`.
- Marks optional fields with a translated "(optional)" rather than marking required with `*`.
  Decision pending (AVG-5).

## Behaviour rules

1. `noValidate` on `<form>`: our messages, not the browser's.
2. Validate on submit first, then on change for fields that already failed
   (`mode: "onSubmit"`, `reValidateMode: "onChange"`).
3. Disable submit only while submitting, never because the form is invalid (users need to
   see why).
4. On submit failure, focus the first invalid field (react-hook-form `shouldFocusError`, on
   by default).
5. Edit forms load data with the query hook, then `reset(data)` once; show the page skeleton
   until then.
6. Warn before leaving a dirty form. Decided (AVG-6): the router is in declarative mode, so
   `useBlocker` is not available; use a `beforeunload` listener while dirty and a confirm on
   in-app cancel.
7. Dates and numbers: inputs handle the locale; values sent to the API are ISO strings and
   plain numbers (see 011).

## Tests

- Submitting empty shows each required message (translated) and does not call the API.
- A 422 with `fieldErrors` shows the message next to the field.
- A 409/500 shows the summary and a toast.
- Success navigates and invalidates the list (MSW, see 013).

## Anti-patterns

- `useState` per field.
- Text literals in zod messages (`"Campo obrigatório"`).
- Showing `error.message` from the API.
- A second validation library or hand-rolled validators duplicating the schema.
