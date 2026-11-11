import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { BootScreen } from '@/shared/design-system/components';

export default function AdminLayout() {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-fg">
      <header className="border-b border-border bg-surface-raised px-6 py-3">
        <p className="font-display text-sm font-bold">{t('admin:layout.title')}</p>
      </header>
      <main className="flex-1">
        <Suspense fallback={<BootScreen label={t('common:states.loading')} />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
