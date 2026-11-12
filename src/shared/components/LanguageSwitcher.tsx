import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, isLanguage, SUPPORTED_LANGUAGES } from '@/shared/i18n/config';
import { useLanguage } from '@/shared/i18n/use-language';

/** Native select: keyboard and screen reader support come with the element. */
export function LanguageSwitcher() {
  const { t } = useTranslation();
  const language = useLanguage();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const { value } = event.target;

    if (isLanguage(value)) {
      void changeLanguage(value);
    }
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="sr-only">{t('language.label')}</span>
      <select
        value={language}
        onChange={handleChange}
        className="rounded-md border border-border bg-surface-raised px-2 py-1 text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        {SUPPORTED_LANGUAGES.map((option) => (
          <option key={option} value={option} lang={option}>
            {t(`language.names.${option}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
