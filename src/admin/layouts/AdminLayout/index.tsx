import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet } from 'react-router';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { RouteErrorBoundary } from '@/shared/components/RouteErrorBoundary';
import { ScrollToTop } from '@/shared/components/ScrollToTop';
import { PATHS } from '@/admin/paths';

// Frame only: the admin navigation arrives with the admin layout task.
export default function AdminLayout() {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-fg">
      <ScrollToTop />
      <header className="flex items-center justify-between gap-4 border-b border-border bg-surface-raised px-6 py-3">
        <p className="font-display text-sm font-bold">{t('admin:layout.title')}</p>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {/* The portal is another entry: a plain link loads it, the router cannot. */}
          <a href="/" className="text-sm font-medium">
            {t('common:navigation.backToPortal')}
          </a>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-56 shrink-0 border-r border-border p-4">
          <nav aria-label={t('admin:layout.navigation')} className="flex flex-col gap-1">
            <NavLink
              to={PATHS.dashboard}
              end
              className="rounded-md px-3 py-2 text-sm aria-[current=page]:bg-accent aria-[current=page]:text-accent-fg"
            >
              {t('admin:dashboard.title')}
            </NavLink>
          </nav>
        </aside>
        <main className="flex flex-1 flex-col">
          <RouteErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <Outlet />
            </Suspense>
          </RouteErrorBoundary>
        </main>
      </div>
    </div>
  );
}
