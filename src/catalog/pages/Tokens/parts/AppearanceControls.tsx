import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Airline, Appearance, ResolvedTheme } from '@/shared/design-system/theme';

type AirlineOption = Airline | 'group';

const AIRLINE_OPTIONS: AirlineOption[] = ['group', 'taag', 'world'];
const THEME_OPTIONS: ResolvedTheme[] = ['light', 'dark'];

interface AppearanceControlsProps {
  appearance: Appearance;
  onAppearanceChange: (appearance: Appearance) => void;
}

const LEGEND = 'text-xs font-medium tracking-label text-fg-muted uppercase';
const OPTION = 'flex items-center gap-2 text-sm';

/** Native radio groups: arrow keys move between options, as screen readers expect. */
export function AppearanceControls({ appearance, onAppearanceChange }: AppearanceControlsProps) {
  const { t } = useTranslation('catalog');
  const selectedAirline: AirlineOption = appearance.airline ?? 'group';

  function handleAirlineChange(event: ChangeEvent<HTMLInputElement>) {
    const airline = AIRLINE_OPTIONS.find((option) => option === event.target.value) ?? 'group';

    onAppearanceChange({ ...appearance, airline: airline === 'group' ? null : airline });
  }

  function handleThemeChange(event: ChangeEvent<HTMLInputElement>) {
    const theme = event.target.value === 'dark' ? 'dark' : 'light';

    onAppearanceChange({ ...appearance, theme });
  }

  return (
    <div className="flex flex-wrap items-end gap-6">
      <fieldset className="flex flex-col gap-1">
        <legend className={LEGEND}>{t('appearance.airline')}</legend>
        <div className="flex gap-4">
          {AIRLINE_OPTIONS.map((option) => (
            <label key={option} className={OPTION}>
              <input
                type="radio"
                name="airline"
                value={option}
                checked={selectedAirline === option}
                onChange={handleAirlineChange}
              />
              {t(`appearance.airlines.${option}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="flex flex-col gap-1">
        <legend className={LEGEND}>{t('appearance.theme')}</legend>
        <div className="flex gap-4">
          {THEME_OPTIONS.map((option) => (
            <label key={option} className={OPTION}>
              <input
                type="radio"
                name="theme"
                value={option}
                checked={appearance.theme === option}
                onChange={handleThemeChange}
              />
              {t(`appearance.themes.${option}`)}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
