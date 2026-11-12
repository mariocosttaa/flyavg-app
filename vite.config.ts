import path from 'node:path';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import { isCatalogBuilt } from './scripts/catalog-environments.mjs';

const ROOT = import.meta.dirname;

// Vite's history fallback serves the portal index.html for every unknown path, so a deep
// link like /admin/pilots would boot the portal. Mirror the nginx fallback in dev and preview.
function adminFallback(): Plugin {
  const rewrite: Connect.NextHandleFunction = (request, _response, next) => {
    const url = request.url ?? '';
    const pathname = url.split('?')[0] ?? '';
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

    if (isAdminRoute && !path.extname(pathname)) {
      request.url = '/admin/index.html';
    }

    next();
  };

  return {
    name: 'flyavg-admin-fallback',
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  };
}

export default defineConfig(({ mode }) => {
  // loadEnv gives process.env priority over .env files, like Vite does for the app itself.
  const { VITE_APP_ENV } = loadEnv(mode, ROOT, 'VITE_');
  // The catalog shows work in progress: it never ships in a production build.
  const catalogInput: Record<string, string> = isCatalogBuilt(VITE_APP_ENV)
    ? { catalog: path.resolve(ROOT, 'catalog/index.html') }
    : {};

  return {
    plugins: [adminFallback(), react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
    resolve: { alias: { '@': path.resolve(ROOT, 'src') } },
    build: {
      manifest: true,
      rolldownOptions: {
        input: {
          portal: path.resolve(ROOT, 'index.html'),
          admin: path.resolve(ROOT, 'admin/index.html'),
          ...catalogInput,
        },
      },
    },
  };
});
