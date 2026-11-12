import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { usePageTitle } from '@/shared/hooks/use-page-title';
import { PATHS } from '@/portal/paths';

export default function NotFound() {
  const { t } = useTranslation();

  usePageTitle(t('notFound.title'));

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl">{t('notFound.title')}</h1>
      <p className="text-fg-muted">{t('notFound.body')}</p>
      <Link to={PATHS.home} className="rounded-md bg-accent px-4 py-2 font-medium text-accent-fg">
        {t('notFound.backHome')}
      </Link>
    </section>
  );
}
