import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAuthConfig } from '@/shared/auth/auth-config';

/** Shown when a page crashes; a reload also recovers from chunks removed by a new deploy. */
export function CrashScreen() {
  const { t } = useTranslation();
  const { homePath } = useAuthConfig();

  return (
    <section
      role="alert"
      className="flex flex-col items-center justify-center gap-4 p-16 text-center"
    >
      <h1 className="text-3xl">{t('crash.title')}</h1>
      <p className="text-fg-muted">{t('crash.body')}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-accent px-4 py-2 font-medium text-accent-fg"
        >
          {t('crash.reload')}
        </button>
        <Link to={homePath} className="rounded-md border border-border px-4 py-2 font-medium">
          {t('navigation.backHome')}
        </Link>
      </div>
    </section>
  );
}
