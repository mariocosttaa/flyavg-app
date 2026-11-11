// FlyAVG code style: rules that keep the code reading as if a careful person wrote it.
// Real names, normal spacing between steps, shallow nesting, explicit control flow.
//
// This file is identical in flyavg-api and flyavg-app. Change both, or neither.

import stylistic from '@stylistic/eslint-plugin';
import unicorn from 'eslint-plugin-unicorn';

// Abbreviations we accept because they are the established name in our stack.
const allowedAbbreviations = {
  args: true,
  db: true,
  dto: true,
  Dto: true,
  e2e: true,
  env: true,
  i18n: true,
  params: true,
  Params: true,
  props: true,
  Props: true,
  ref: true,
  refs: true,
};

// Names that say nothing about what they hold.
const meaninglessNames = [
  'asdf',
  'bar',
  'baz',
  'dummy',
  'foo',
  'obj',
  'stuff',
  'temp',
  'thing',
  'tmp',
];

export const codeStyle = {
  plugins: {
    '@stylistic': stylistic,
    unicorn,
  },
  rules: {
    // Names
    'id-length': [
      'error',
      { min: 2, exceptions: ['_', 'i', 'j', 't', 'x', 'y', 'z'], properties: 'never' },
    ],
    'id-denylist': ['error', ...meaninglessNames],
    'unicorn/catch-error-name': ['error', { name: 'error' }],
    'unicorn/prevent-abbreviations': [
      'error',
      { allowList: allowedAbbreviations, checkFilenames: false, checkProperties: false },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
      { selector: 'import', format: ['camelCase', 'PascalCase'] },
      { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
      // Destructured keys keep the name of their source (env vars, payloads).
      { selector: ['variable', 'parameter'], modifiers: ['destructured'], format: null },
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['PascalCase'],
        prefix: ['is', 'has', 'can', 'should', 'was', 'will', 'did', 'needs', 'allows'],
      },
      { selector: 'function', format: ['camelCase', 'PascalCase'] },
      { selector: 'typeLike', format: ['PascalCase'] },
      { selector: 'enumMember', format: ['PascalCase', 'UPPER_CASE'] },
      // Object keys follow external contracts (HTTP headers, env vars, API payloads).
      { selector: ['objectLiteralProperty', 'typeProperty'], format: null },
    ],

    // Control flow that reads top to bottom
    curly: ['error', 'all'],
    eqeqeq: ['error', 'always'],
    'no-else-return': ['error', { allowElseIf: false }],
    'no-nested-ternary': 'error',
    'no-lonely-if': 'error',
    'max-depth': ['error', 3],
    'max-params': ['error', 4],
    complexity: ['error', 15],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-template': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'no-console': 'error',

    // TypeScript hygiene
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'separate-type-imports' }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],

    // Spacing between steps, the way a person separates thoughts
    '@stylistic/padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' },
      { blankLine: 'always', prev: ['const', 'let'], next: '*' },
      { blankLine: 'any', prev: ['const', 'let'], next: ['const', 'let'] },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: ['if', 'for', 'while', 'try', 'switch'] },
      { blankLine: 'any', prev: 'directive', next: '*' },
    ],
    '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    '@stylistic/spaced-comment': ['error', 'always', { markers: ['/'] }],
  },
};

// eslint-config-prettier switches `curly` off. This block goes after it, so braces on
// every `if` are still required (Prettier keeps them; it never removes or adds braces).
export const codeStyleAfterPrettier = {
  rules: {
    curly: ['error', 'all'],
  },
};
