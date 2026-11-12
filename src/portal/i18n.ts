import { loadNamespace } from '@/shared/i18n/config';

export const loadLandingNamespace = () =>
  loadNamespace('landing', {
    pt: () => import('@/shared/i18n/locales/pt/landing.json'),
    en: () => import('@/shared/i18n/locales/en/landing.json'),
  });

export const loadAuthNamespace = () =>
  loadNamespace('auth', {
    pt: () => import('@/shared/i18n/locales/pt/auth.json'),
    en: () => import('@/shared/i18n/locales/en/auth.json'),
  });

export const loadPilotNamespace = () =>
  loadNamespace('pilot', {
    pt: () => import('@/shared/i18n/locales/pt/pilot.json'),
    en: () => import('@/shared/i18n/locales/en/pilot.json'),
  });
