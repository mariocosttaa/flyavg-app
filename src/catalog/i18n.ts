import { loadNamespace } from '@/shared/i18n/config';

export const loadCatalogNamespace = () =>
  loadNamespace('catalog', {
    pt: () => import('@/shared/i18n/locales/pt/catalog.json'),
    en: () => import('@/shared/i18n/locales/en/catalog.json'),
  });
