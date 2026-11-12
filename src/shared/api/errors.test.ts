import { describe, expect, it } from 'vitest';
import { toApiError, unwrap } from './errors';

// The error body comes from the network, so every field is narrowed before use.
describe('toApiError', () => {
  it('maps the standard body: code, details, field errors and request id', () => {
    const error = toApiError(400, {
      statusCode: 400,
      code: 'VALIDATION_FAILED',
      message: 'Request validation failed.',
      details: { hint: 1 },
      errors: [{ field: 'limit', code: 'MAX', params: { max: 100 } }, { field: 42 }],
      requestId: 'request-1',
    });

    expect(error).toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
      details: { hint: 1 },
      fieldErrors: [{ field: 'limit', code: 'MAX', params: { max: 100 } }],
      requestId: 'request-1',
    });
  });

  it.each([null, 'Bad gateway', { message: 'no code' }, [1, 2]])(
    'falls back to UNKNOWN_ERROR for %j',
    (body) => {
      expect(toApiError(502, body)).toMatchObject({ status: 502, code: 'UNKNOWN_ERROR' });
    },
  );
});

describe('unwrap', () => {
  it('returns the data of a successful call', () => {
    expect(unwrap({ data: { ok: true }, response: new Response() })).toEqual({ ok: true });
  });

  it('accepts a success without a body (204)', () => {
    const response = new Response(null, { status: 204 });

    expect(unwrap({ data: undefined, response })).toBeUndefined();
  });

  it('throws the mapped error of a failed call', () => {
    const response = new Response(null, { status: 404 });

    expect(() => unwrap({ error: { code: 'NOT_FOUND' }, response })).toThrow(
      expect.objectContaining({ status: 404, code: 'NOT_FOUND' }),
    );
  });
});
