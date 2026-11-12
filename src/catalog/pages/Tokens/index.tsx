import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import {
  applyTheme,
  appliedAppearance,
  setAirline,
  type Appearance,
} from '@/shared/design-system/theme';
import { usePageTitle } from '@/shared/hooks/use-page-title';
import { AppearanceControls } from './parts/AppearanceControls';
import { ColorTokens } from './parts/ColorTokens';
import { ContrastTable } from './parts/ContrastTable';
import { MotionTokens } from './parts/MotionTokens';
import { RadiusAndShadowTokens } from './parts/RadiusAndShadowTokens';
import { SpacingScale } from './parts/SpacingScale';
import { TypeScale } from './parts/TypeScale';

export default function Tokens() {
  const { t } = useTranslation('catalog');
  const [appearance, setAppearance] = useState<Appearance>(appliedAppearance);

  usePageTitle(t('title'));

  function handleAppearanceChange(nextAppearance: Appearance) {
    setAirline(nextAppearance.airline);
    applyTheme(nextAppearance.theme);
    setAppearance(nextAppearance);
  }

  return (
    <div className="min-h-dvh bg-surface text-fg">
      <header className="sticky top-0 z-sticky flex flex-wrap items-end justify-between gap-4 border-b border-border bg-surface-raised px-6 py-4 shadow-raised">
        <h1 className="font-brand text-xl">{t('title')}</h1>
        <div className="flex flex-wrap items-end gap-6">
          <AppearanceControls appearance={appearance} onAppearanceChange={handleAppearanceChange} />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-8">
        <p className="max-w-3xl text-lg text-fg-muted">{t('intro')}</p>
        <ColorTokens appearance={appearance} />
        <ContrastTable appearance={appearance} />
        <TypeScale />
        <SpacingScale />
        <RadiusAndShadowTokens />
        <MotionTokens />
      </main>
    </div>
  );
}
