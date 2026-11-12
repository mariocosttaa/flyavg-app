import '@/shared/design-system/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyTheme } from '@/shared/design-system/theme';
import { initI18n } from '@/shared/i18n/config';
import { loadCatalogNamespace } from './i18n';
import Tokens from './pages/Tokens';

// The catalog follows the OS once at boot, without listening: after that, its controls decide.
applyTheme('system');
await initI18n();
await loadCatalogNamespace();

const root = document.getElementById('root');

if (!root) {
  throw new Error('Catalog root element is missing from catalog/index.html');
}

createRoot(root).render(
  <StrictMode>
    <Tokens />
  </StrictMode>,
);
