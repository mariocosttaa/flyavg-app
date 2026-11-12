import { describe, expect, it } from 'vitest';
import { ApiError } from './errors';
import { shouldRetry } from './query-client';

// 4xx answers will not change on retry; network and server errors get two more tries.
describe('shouldRetry', () => {
  it('never retries a client error', () => {
    expect(shouldRetry(0, new ApiError(404, 'NOT_FOUND'))).toBe(false);
  });

  it('retries server and network errors twice', () => {
    expect(shouldRetry(0, new ApiError(500, 'INTERNAL_ERROR'))).toBe(true);
    expect(shouldRetry(1, new ApiError(0, 'NETWORK_ERROR'))).toBe(true);
    expect(shouldRetry(2, new ApiError(503, 'INTERNAL_ERROR'))).toBe(false);
  });
});
