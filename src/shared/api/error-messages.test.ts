import i18n from 'i18next';
import { describe, expect, it } from 'vitest';
import { errorMessageKey, fieldErrorMessageKey } from './error-messages';

// API codes map to translation keys; unknown codes fall back to a generic message.
describe('errorMessageKey', () => {
  it('uses the API code as the key', () => {
    expect(errorMessageKey('RATE_LIMITED')).toBe('errors:RATE_LIMITED');
    expect(i18n.t(errorMessageKey('RATE_LIMITED'))).toBe(
      'Demasiados pedidos. Aguarde um momento e tente novamente.',
    );
  });

  it('falls back to UNKNOWN_ERROR for a code without translation', () => {
    expect(errorMessageKey('SOMETHING_NEW')).toBe('errors:UNKNOWN_ERROR');
    expect(errorMessageKey('validation')).toBe('errors:UNKNOWN_ERROR');
  });
});

describe('fieldErrorMessageKey', () => {
  it('translates a field code with its params', () => {
    expect(i18n.t(fieldErrorMessageKey('MAX_LENGTH'), { max: 100 })).toBe(
      'Máximo de 100 caracteres.',
    );
  });

  it('falls back to INVALID for an unknown field code', () => {
    expect(fieldErrorMessageKey('SOMETHING_NEW')).toBe('errors:validation.INVALID');
  });
});
