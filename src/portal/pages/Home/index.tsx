import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/shared/hooks/use-page-title';

export default function Home() {
  const { t } = useTranslation('landing');

  usePageTitle(t('home.title'));

  return (
    <section className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-display">{t('home.title')}</h1>
      <p className="text-lg text-fg-muted">{t('home.status')}</p>
    </section>
  );
}
