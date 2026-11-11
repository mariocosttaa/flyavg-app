import type admin from './locales/pt/admin.json';
import type common from './locales/pt/common.json';
import type errors from './locales/pt/errors.json';
import type landing from './locales/pt/landing.json';

// Typed against pt: a missing key is a compile error. Type imports are erased from bundles.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      admin: typeof admin;
      common: typeof common;
      errors: typeof errors;
      landing: typeof landing;
    };
    returnNull: false;
  }
}
