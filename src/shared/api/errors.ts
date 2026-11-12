import type { components } from './generated/schema';

export type ErrorResponse = components['schemas']['ErrorResponseDto'];
export type FieldError = components['schemas']['FieldErrorDto'];

/** The body had no API error code (a proxy page, an empty body). */
export const UNKNOWN_ERROR_CODE = 'UNKNOWN_ERROR';
/** fetch itself failed: offline, DNS, CORS. */
export const NETWORK_ERROR_CODE = 'NETWORK_ERROR';

interface ApiErrorOptions {
  details?: Record<string, unknown>;
  fieldErrors?: readonly FieldError[];
  requestId?: string;
}

// Thrown by every API call. The UI translates `code`; the API message is never shown.
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: Record<string, unknown>;
  readonly fieldErrors: readonly FieldError[];
  readonly requestId: string | undefined;

  constructor(status: number, code: string, options: ApiErrorOptions = {}) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = options.details ?? {};
    this.fieldErrors = options.fieldErrors ?? [];
    this.requestId = options.requestId;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFieldError(value: unknown): value is FieldError {
  return isRecord(value) && typeof value.field === 'string' && typeof value.code === 'string';
}

// The body comes from the network: narrow every field instead of trusting the schema.
export function toApiError(status: number, body: unknown): ApiError {
  if (!isRecord(body) || typeof body.code !== 'string') {
    return new ApiError(status, UNKNOWN_ERROR_CODE);
  }

  return new ApiError(status, body.code, {
    details: isRecord(body.details) ? body.details : {},
    fieldErrors: Array.isArray(body.errors) ? body.errors.filter(isFieldError) : [],
    requestId: typeof body.requestId === 'string' ? body.requestId : undefined,
  });
}

/** Turns an openapi-fetch result into its data, or throws the ApiError. */
export function unwrap<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (!result.response.ok || result.error !== undefined) {
    throw toApiError(result.response.status, result.error);
  }

  // A 204 succeeds without a body; its generated type has no data either.
  return result.data as T;
}
