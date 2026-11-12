import errors from '@/shared/i18n/locales/pt/errors.json';
import { UNKNOWN_ERROR_CODE } from './errors';

type ErrorCode = Exclude<keyof typeof errors, 'validation'>;
type ValidationCode = keyof (typeof errors)['validation'];

const FALLBACK_VALIDATION_CODE = 'INVALID' satisfies ValidationCode;

function isErrorCode(code: string): code is ErrorCode {
  return code !== 'validation' && Object.hasOwn(errors, code);
}

function isValidationCode(code: string): code is ValidationCode {
  return Object.hasOwn(errors.validation, code);
}

/** i18n key for an API error code, falling back to the generic message for unknown codes. */
export function errorMessageKey(code: string): `errors:${ErrorCode}` {
  return `errors:${isErrorCode(code) ? code : UNKNOWN_ERROR_CODE}`;
}

/** i18n key for a field error code; pass the error's `params` to `t` for the values. */
export function fieldErrorMessageKey(code: string): `errors:validation.${ValidationCode}` {
  return `errors:validation.${isValidationCode(code) ? code : FALLBACK_VALIDATION_CODE}`;
}
