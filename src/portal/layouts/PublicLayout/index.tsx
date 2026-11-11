import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';
import { BootScreen } from '@/shared/design-system/components';

export default function PublicLayout() {
  const { t } = useTranslation();

  return (
    <main className="min-h-dvh bg-surface text-fg">
      <Suspense fallback={<BootScreen label={t('states.loading')} />}>
        <Outlet />
      </Suspense>
    </main>
  );
}
