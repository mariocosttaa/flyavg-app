import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import commonEn from './locales/en/common.json';
import errorsEn from './locales/en/errors.json';
import commonPt from './locales/pt/common.json';
import errorsPt from './locales/pt/errors.json';

export const SUPPORTED_LANGUAGES = ['pt', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'pt';
// Decision pending (AVG-6): en-GB (24-hour, day-month) vs en-US for English formatting.
export const INTL_LOCALE: Record<Language, string> = { pt: 'pt-PT', en: 'en-GB' };

const LANGUAGE_KEY = 'flyavg.language'; // UI preference only

// Bundled with every entry; area namespaces load with their route through loadNamespace.
const resources = {
  pt: { common: commonPt, errors: errorsPt },
  en: { common: commonEn, errors: errorsEn },
};

export type NamespaceLoaders = Record<Language, () => Promise<{ default: object }>>;

// Loaders are declared by each entry, so admin strings never enter the portal module graph.
const registeredNamespaces = new Map<string, NamespaceLoaders>();

export function isLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.some((language) => language === value);
}

/** Stored choice, then the browser languages, then the default. */
export function detectLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_KEY);

    if (isLanguage(stored)) {
      return stored;
    }
  } catch {
    // Blocked storage: continue with the browser language.
  }

  const browserLanguage = navigator.languages
    .map((tag) => tag.slice(0, 2).toLowerCase())
    .find(isLanguage);

  return browserLanguage ?? DEFAULT_LANGUAGE;
}

export function currentLanguage(): Language {
  return isLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LANGUAGE;
}

function syncHtmlLang(language: string): void {
  document.documentElement.lang = isLanguage(language) ? INTL_LOCALE[language] : 'pt-PT';
}

export async function initI18n(language: Language = detectLanguage()): Promise<void> {
  i18n.on('languageChanged', syncHtmlLang);
  await i18n.use(initReactI18next).init({
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],
    defaultNS: 'common',
    ns: ['common', 'errors'],
    interpolation: { escapeValue: false }, // React escapes already
    returnNull: false,
    resources,
  });
  syncHtmlLang(language);
}

async function addNamespace(language: Language, ns: string, loaders: NamespaceLoaders) {
  if (i18n.hasResourceBundle(language, ns)) {
    return;
  }

  const bundle = await loaders[language]();

  i18n.addResourceBundle(language, ns, bundle.default);
}

export async function loadNamespace(ns: string, loaders: NamespaceLoaders): Promise<void> {
  registeredNamespaces.set(ns, loaders);
  await addNamespace(currentLanguage(), ns, loaders);
}

export async function changeLanguage(language: Language): Promise<void> {
  // Load the namespaces already in use first, so no raw keys flash after the switch.
  await Promise.all(
    [...registeredNamespaces].map(([ns, loaders]) => addNamespace(language, ns, loaders)),
  );

  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Blocked storage: the choice lasts for this session only.
  }

  await i18n.changeLanguage(language);
}
