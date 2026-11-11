import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/shared/hooks/use-page-title';

export default function Dashboard() {
  const { t } = useTranslation('admin');

  usePageTitle(t('dashboard.title'));

  return (
    <section className="flex flex-col items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-3xl">{t('dashboard.title')}</h1>
      <p className="text-lg text-fg-muted">{t('dashboard.status')}</p>
    </section>
  );
}
