import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, Outlet } from 'react-router';
import { useSession } from '@/shared/auth';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { RouteErrorBoundary } from '@/shared/components/RouteErrorBoundary';
import { ScrollToTop } from '@/shared/components/ScrollToTop';
import { PATHS } from '@/portal/paths';

// Frame only: the navigation and top bar content arrive with the portal layout task.
export default function PilotLayout() {
  const { t } = useTranslation();
  const session = useSession();
  const displayName = session.status === 'authenticated' ? session.user.displayName : '';

  return (
    <div className="flex min-h-dvh bg-surface text-fg">
      <ScrollToTop />
      <aside className="w-60 shrink-0 border-r border-border bg-surface-raised p-4">
        <Link to={PATHS.home} className="font-brand text-lg font-bold">
          {t('app.name')}
        </Link>
        <nav aria-label={t('navigation.main')} className="mt-6 flex flex-col gap-1">
          <NavLink
            to={PATHS.pilotHome}
            end
            className="rounded-md px-3 py-2 aria-[current=page]:bg-accent aria-[current=page]:text-accent-fg"
          >
            {t('navigation.home')}
          </NavLink>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-4 border-b border-border px-6 py-3">
          <span className="text-sm text-fg-muted">{displayName}</span>
          <LanguageSwitcher />
        </header>
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
