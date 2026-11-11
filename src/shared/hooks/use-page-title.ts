import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function usePageTitle(title: string): void {
  const { t } = useTranslation('common');
  const appName = t('app.name');

  useEffect(() => {
    document.title = title === appName ? appName : `${title} · ${appName}`;
  }, [title, appName]);
}
