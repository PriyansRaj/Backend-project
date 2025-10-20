import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig({
  files: ['**/*.{js,mjs,cjs}'],
  plugins: {
    js,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // integrates Prettier with ESLint
  ],
  languageOptions: {
    globals: globals.browser,
  },
  rules: {
    'padding-line-between-statements': [
      'error',
      // Require blank line after variable declarations
      { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
      // Require blank line before return
      { blankLine: 'always', prev: '*', next: 'return' },
      // Require blank line between all statements
      { blankLine: 'always', prev: '*', next: '*' },
    ],
  },
});
