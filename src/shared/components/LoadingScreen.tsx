import { useTranslation } from 'react-i18next';
import { BootScreen } from '@/shared/design-system/components';

/** The one loading screen for guards and route chunks, with its translated name. */
export function LoadingScreen() {
  const { t } = useTranslation();

  return <BootScreen label={t('states.loading')} />;
}
