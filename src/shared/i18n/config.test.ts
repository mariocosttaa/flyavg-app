import i18n from 'i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { changeLanguage, detectLanguage } from './config';

// Language detection order and the <html lang> sync.
describe('i18n config', () => {
  afterEach(async () => {
    vi.unstubAllGlobals();
    localStorage.clear();
    await changeLanguage('pt');
    localStorage.clear();
  });

  it('prefers the stored language over the browser', () => {
    localStorage.setItem('flyavg.language', 'en');
    vi.stubGlobal('navigator', { languages: ['pt-PT'] });
    expect(detectLanguage()).toBe('en');
  });

  it('uses the first supported browser language', () => {
    vi.stubGlobal('navigator', { languages: ['fr-FR', 'en-US', 'pt-PT'] });
    expect(detectLanguage()).toBe('en');
  });

  it('falls back to pt for unsupported browser languages', () => {
    vi.stubGlobal('navigator', { languages: ['fr-FR'] });
    expect(detectLanguage()).toBe('pt');
  });

  it('updates <html lang> and stores the choice on change', async () => {
    await changeLanguage('en');
    expect(document.documentElement.lang).toBe('en-GB');
    expect(localStorage.getItem('flyavg.language')).toBe('en');
    expect(i18n.t('states.loading')).toBe('Loading');
  });
});
