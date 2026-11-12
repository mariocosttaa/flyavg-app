import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import i18next from 'eslint-plugin-i18next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import { reactRefresh } from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { codeStyle, codeStyleAfterPrettier } from './eslint.code-style.mjs';

// no-restricted-imports blocks do not merge (the last matching block wins), so each folder
// lists every pattern that applies to it.
const NO_ADMIN = {
  group: ['@/admin', '@/admin/**', '**/admin/**'],
  message: 'Portal and shared code must not import admin code.',
};
const NO_PORTAL = {
  group: ['@/portal', '@/portal/**', '**/portal/**'],
  message: 'Admin and shared code must not import portal code.',
};
const NO_CATALOG = {
  group: ['@/catalog', '@/catalog/**', '**/catalog/**'],
  message: 'The catalog is a separate entry left out of production builds: never import it.',
};
const NO_API = {
  group: ['@/shared/api', '@/shared/api/**'],
  message: 'Design system components are data-free: no API imports.',
};
const NO_DOM_ROUTER = {
  name: 'react-router-dom',
  message: 'Import from react-router.',
};

const restrict = (...patterns) => ['error', { paths: [NO_DOM_ROUTER], patterns }];

export default defineConfig(
  globalIgnores([
    'dist',
    'coverage',
    'node_modules',
    'playwright-report',
    'test-results',
    '.claude',
    '.githooks',
    'src/shared/api/generated',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite(),
      codeStyle,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    files: ['src/**/*.tsx'],
    extends: [jsxA11y.flatConfigs.recommended],
  },
  {
    files: ['src/**/*.tsx'],
    ignores: ['src/**/*.test.tsx', 'src/test/**'],
    extends: [i18next.configs['flat/recommended']],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrict() },
  },
  {
    files: ['src/portal/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrict(NO_ADMIN, NO_CATALOG) },
  },
  {
    files: ['src/admin/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrict(NO_PORTAL, NO_CATALOG) },
  },
  {
    files: ['src/catalog/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrict(NO_ADMIN, NO_PORTAL, NO_API) },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrict(NO_ADMIN, NO_PORTAL, NO_CATALOG) },
  },
  {
    files: ['src/shared/design-system/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrict(NO_ADMIN, NO_PORTAL, NO_CATALOG, NO_API) },
  },
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  prettier,
  codeStyleAfterPrettier,
);
