/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.spec.ts',
    '**/package-lock.json',
    '**/*.docx',
    'eslint-report.json',
  ],
  overrides: [
    {
      files: ['backend-service-a/**/*.js', 'backend-service-b/**/*.js', 'shared/**/*.js'],
      env: {
        node: true,
        es2022: true,
      },
      extends: ['eslint:recommended'],
      rules: {
        'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'no-var': 'error',
        'no-warning-comments': ['error', { terms: ['temporary testing'], location: 'anywhere' }],
      },
    },
    {
      files: ['frontend/src/**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      parserOptions: {
        project: './frontend/tsconfig.app.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        'no-warning-comments': ['error', { terms: ['temporary testing'], location: 'anywhere' }],
      },
    },
  ],
};
