import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatFlightDateTime,
  formatFlightTime,
  formatNumber,
  type DateInput,
} from './format';
import { useLanguage } from './use-language';

/** Formatters bound to the current language; components re-render when it changes. */
export function useFormat() {
  const language = useLanguage();

  return {
    date: (value: DateInput, options?: Intl.DateTimeFormatOptions) =>
      formatDate(value, language, options),
    dateTime: (value: DateInput, options?: Intl.DateTimeFormatOptions) =>
      formatDateTime(value, language, options),
    flightTime: (value: DateInput) => formatFlightTime(value, language),
    flightDateTime: (value: DateInput) => formatFlightDateTime(value, language),
    number: (value: number, options?: Intl.NumberFormatOptions) =>
      formatNumber(value, language, options),
    duration: formatDuration,
  };
}
