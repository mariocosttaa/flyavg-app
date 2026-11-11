import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      // env.ts validates on import; tests get safe placeholder values.
      env: {
        VITE_API_URL: 'http://api.test',
        VITE_APP_ENV: 'development',
        VITE_SITE_URL: 'http://localhost:5173',
      },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/shared/api/generated/**',
          'src/**/main.tsx',
          'src/catalog/**',
          'src/test/**',
        ],
      },
    },
  }),
);
