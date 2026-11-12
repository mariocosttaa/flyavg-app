import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'react-i18next';
import { afterEach, describe, expect, it } from 'vitest';
import { changeLanguage } from '@/shared/i18n/config';
import { useFormat } from '@/shared/i18n/use-format';
import { renderWithProviders } from '@/test/render';
import { LanguageSwitcher } from './LanguageSwitcher';

// Language switch: strings, formatters, <html lang> and the stored choice follow it.
function TranslatedProbe() {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <p>
      {t('navigation.signIn')} · {format.number(1234.5)}
    </p>
  );
}

describe('LanguageSwitcher', () => {
  // i18n is a global singleton: put pt back for the next tests.
  afterEach(async () => {
    await changeLanguage('pt');
    localStorage.clear();
  });

  it('switches to English with the keyboard and remembers the choice', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <>
        <LanguageSwitcher />
        <TranslatedProbe />
      </>,
    );

    const select = screen.getByRole('combobox', { name: 'Idioma' });

    expect(select).toHaveValue('pt');
    expect(screen.getByText(/Iniciar sessão/)).toBeInTheDocument();

    await user.selectOptions(select, 'English');

    expect(await screen.findByRole('combobox', { name: 'Language' })).toHaveValue('en');
    expect(screen.getByText('Sign in · 1,234.5')).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('en-GB');
    expect(localStorage.getItem('flyavg.language')).toBe('en');
  });

  it('names each language in its own language', () => {
    renderWithProviders(<LanguageSwitcher />);

    expect(screen.getByRole('option', { name: 'Português' })).toHaveAttribute('lang', 'pt');
    expect(screen.getByRole('option', { name: 'English' })).toHaveAttribute('lang', 'en');
  });
});
