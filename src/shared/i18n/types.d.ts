import type admin from './locales/pt/admin.json';
import type auth from './locales/pt/auth.json';
import type catalog from './locales/pt/catalog.json';
import type common from './locales/pt/common.json';
import type errors from './locales/pt/errors.json';
import type landing from './locales/pt/landing.json';
import type pilot from './locales/pt/pilot.json';

// Typed against pt: a missing key is a compile error. Type imports are erased from bundles.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      admin: typeof admin;
      auth: typeof auth;
      catalog: typeof catalog;
      common: typeof common;
      errors: typeof errors;
      landing: typeof landing;
      pilot: typeof pilot;
    };
    returnNull: false;
  }
}
