import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatFlightDateTime,
  formatFlightTime,
  formatNumber,
} from './format';

// Intl output for pt-PT and en-GB. Intl may use narrow or no-break spaces, so the
// assertions normalise every space-like character to a plain space.
const plain = (text: string) => text.replaceAll(/\s/gu, ' ');

// 23:30 UTC, so a non-UTC time zone would also move the calendar day.
const LATE_DEPARTURE = '2026-11-12T23:30:00Z';

describe('flight times', () => {
  it('shows the clock in UTC with a marker, in both languages', () => {
    expect(plain(formatFlightTime(LATE_DEPARTURE, 'pt'))).toBe('23:30 UTC');
    expect(plain(formatFlightTime(LATE_DEPARTURE, 'en'))).toBe('23:30 UTC');
  });

  it('shows date and time in UTC with day before month', () => {
    expect(plain(formatFlightDateTime(LATE_DEPARTURE, 'pt'))).toBe('12/11/2026, 23:30 UTC');
    expect(plain(formatFlightDateTime(LATE_DEPARTURE, 'en'))).toBe('12 Nov 2026, 23:30 UTC');
  });

  it('accepts a Date as well as an ISO string', () => {
    expect(plain(formatFlightTime(new Date(LATE_DEPARTURE), 'en'))).toBe('23:30 UTC');
  });
});

describe('dates', () => {
  it('formats a calendar date per language', () => {
    expect(formatDate(LATE_DEPARTURE, 'pt', { timeZone: 'UTC' })).toBe('12/11/2026');
    expect(formatDate(LATE_DEPARTURE, 'en', { timeZone: 'UTC' })).toBe('12 Nov 2026');
  });

  it('formats date and time on a 24-hour clock in English too', () => {
    expect(plain(formatDateTime(LATE_DEPARTURE, 'en', { timeZone: 'UTC' }))).toBe(
      '12 Nov 2026, 23:30',
    );
  });
});

describe('numbers', () => {
  it('uses the separators of each locale', () => {
    expect(plain(formatNumber(12_345.6, 'pt'))).toBe('12 345,6');
    expect(formatNumber(12_345.6, 'en')).toBe('12,345.6');
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '00:00'],
    [5, '00:05'],
    [125, '02:05'],
    [7530, '125:30'],
    [89.6, '01:30'],
    [-10, '00:00'],
  ])('formats %d minutes as %s', (minutes, expected) => {
    expect(formatDuration(minutes)).toBe(expected);
  });
});
