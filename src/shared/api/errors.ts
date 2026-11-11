// Decision pending (AVG-7): error payload shape to confirm with flyavg-api.
export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message?: string;
  details?: { field: string; code: string }[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: NonNullable<ApiErrorBody['details']>;

  constructor(status: number, code: string, details: ApiErrorBody['details'] = []) {
    super(code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const UNKNOWN_CODE = 'UNKNOWN';

export async function toApiError(response: Response): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);

  if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') {
    const details = 'details' in body && Array.isArray(body.details) ? body.details : [];

    return new ApiError(response.status, body.code, details as ApiErrorBody['details']);
  }

  return new ApiError(response.status, UNKNOWN_CODE);
}
