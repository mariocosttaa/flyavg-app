import { loadNamespace } from '@/shared/i18n/config';

export const loadAdminNamespace = () =>
  loadNamespace('admin', {
    pt: () => import('@/shared/i18n/locales/pt/admin.json'),
    en: () => import('@/shared/i18n/locales/en/admin.json'),
  });
