const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.spec.ts',
      '**/package-lock.json',
      '**/*.docx',
      'eslint.config.js',
    ],
  },
  {
    files: ['backend-service-a/**/*.js', 'backend-service-b/**/*.js', 'shared/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-var': 'error',
      'no-warning-comments': ['error', { terms: ['temporary testing'], location: 'anywhere' }],
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['frontend/src/**/*.ts'],
  })),
  {
    files: ['frontend/src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './frontend/tsconfig.app.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-warning-comments': ['error', { terms: ['temporary testing'], location: 'anywhere' }],
    },
  },
);
