import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAuthConfig } from '@/shared/auth/auth-config';
import { usePageTitle } from '@/shared/hooks/use-page-title';
import { PORTAL_HOME_PATH } from '@/shared/lib/portal-paths';

const ACTION_CLASSES = 'rounded-md bg-accent px-4 py-2 font-medium text-accent-fg';

interface ForbiddenProps {
  /** Admin sends users back to the portal, another entry, so the link is a full page load. */
  hasPortalExit?: boolean;
}

/** Rendered in place by permission guards; it never redirects. */
export function Forbidden({ hasPortalExit = false }: ForbiddenProps) {
  const { t } = useTranslation();
  const { homePath } = useAuthConfig();

  usePageTitle(t('forbidden.title'));

  return (
    <section className="flex flex-col items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-3xl">{t('forbidden.title')}</h1>
      <p className="text-fg-muted">{t('forbidden.body')}</p>
      {hasPortalExit ? (
        <a href={PORTAL_HOME_PATH} className={ACTION_CLASSES}>
          {t('navigation.backToPortal')}
        </a>
      ) : (
        <Link to={homePath} className={ACTION_CLASSES}>
          {t('navigation.backHome')}
        </Link>
      )}
    </section>
  );
}
