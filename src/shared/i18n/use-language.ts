import i18n from 'i18next';
import { useSyncExternalStore } from 'react';
import { currentLanguage, DEFAULT_LANGUAGE, type Language } from './config';

function subscribe(onChange: () => void): () => void {
  i18n.on('languageChanged', onChange);

  return () => i18n.off('languageChanged', onChange);
}

/** Current language as React state, re-rendering on every change. */
export function useLanguage(): Language {
  return useSyncExternalStore(subscribe, currentLanguage, () => DEFAULT_LANGUAGE);
}
