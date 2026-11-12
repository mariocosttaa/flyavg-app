import { INTL_LOCALE, type Language } from './config';

/** ISO 8601 string from the API, or a Date. */
export type DateInput = string | Date;

const MINUTES_PER_HOUR = 60;

// Flight times are always shown in UTC (Zulu), on a 24-hour clock, with the zone marker.
const FLIGHT_TIME: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'UTC',
  timeZoneName: 'short',
};

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Calendar date in the viewer's time zone: "12/11/2026" (pt), "12 Nov 2026" (en). */
export function formatDate(
  value: DateInput,
  language: Language,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[language], { dateStyle: 'medium', ...options }).format(
    toDate(value),
  );
}

/** Date and time in the viewer's time zone, for non-flight events (news, messages). */
export function formatDateTime(
  value: DateInput,
  language: Language,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[language], {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(toDate(value));
}

/** Flight clock time in UTC: "14:05 UTC". */
export function formatFlightTime(value: DateInput, language: Language): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[language], FLIGHT_TIME).format(toDate(value));
}

/** Flight date and time in UTC: "12/11/2026, 14:05 UTC" (pt), "12 Nov 2026, 14:05 UTC" (en). */
export function formatFlightDateTime(value: DateInput, language: Language): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[language], {
    ...FLIGHT_TIME,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(toDate(value));
}

/** Number with the locale's separators: "12 345,6" (pt), "12,345.6" (en). */
export function formatNumber(
  value: number,
  language: Language,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(INTL_LOCALE[language], options).format(value);
}

/** Block time and flight hours as hh:mm, never decimals: 125 → "02:05", 7530 → "125:30". */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainder = minutes % MINUTES_PER_HOUR;

  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
