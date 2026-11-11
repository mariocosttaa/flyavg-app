// Validates the VITE_* variables before anything else runs.
import '@/shared/lib/env';
import '@/shared/design-system/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { applyInitialTheme } from '@/shared/design-system/theme';
import { initI18n } from '@/shared/i18n/config';
import { PortalRoutes } from './routes';

applyInitialTheme(); // sets data-theme before first paint, no inline script
await initI18n();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PortalRoutes />
    </BrowserRouter>
  </StrictMode>,
);
