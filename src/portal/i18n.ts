import { loadNamespace } from '@/shared/i18n/config';

export const loadLandingNamespace = () =>
  loadNamespace('landing', {
    pt: () => import('@/shared/i18n/locales/pt/landing.json'),
    en: () => import('@/shared/i18n/locales/en/landing.json'),
  });
