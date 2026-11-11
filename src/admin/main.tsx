// Validates the VITE_* variables before anything else runs.
import '@/shared/lib/env';
import '@/shared/design-system/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { applyInitialTheme } from '@/shared/design-system/theme';
import { initI18n } from '@/shared/i18n/config';
import { loadAdminNamespace } from './i18n';
import { BASENAME } from './paths';
import { AdminRoutes } from './routes';

applyInitialTheme(); // sets data-theme before first paint, no inline script
await initI18n();
// The admin frame itself is translated, so its namespace loads before the first render.
await loadAdminNamespace();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={BASENAME}>
      <AdminRoutes />
    </BrowserRouter>
  </StrictMode>,
);
