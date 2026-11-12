import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router';
import { useSession } from '@/shared/auth';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { RouteErrorBoundary } from '@/shared/components/RouteErrorBoundary';
import { ScrollToTop } from '@/shared/components/ScrollToTop';
import { PATHS } from '@/portal/paths';

export default function PublicLayout() {
  const { t } = useTranslation();
  const { status } = useSession();
  const isSignedIn = status === 'authenticated';

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-fg">
      <ScrollToTop />
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-3">
        <Link to={PATHS.home} className="font-brand text-lg font-bold">
          {t('app.name')}
        </Link>
        <nav aria-label={t('navigation.main')} className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            to={isSignedIn ? PATHS.pilotHome : PATHS.login}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
          >
            {isSignedIn ? t('navigation.pilotArea') : t('navigation.signIn')}
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col">
        <RouteErrorBoundary>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </main>
    </div>
  );
}
