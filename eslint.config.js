// eslint.config.js
import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Ігнор
  { ignores: ['dist', 'node_modules'] },

  // Базові JS правила
  js.configs.recommended,

  // TypeScript (type-aware) правила
  ...tseslint.configs.recommendedTypeChecked,

  // Вимикаємо конфлікти з Prettier
  prettier,

  // Налаштування для наших файлів
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        // Коректний корінь tsconfig для ESM:
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: ['block', 'block-like', 'return'] },
        {
          blankLine: 'always',
          prev: '*',
          next: ['if', 'for', 'while', 'try', 'function', 'class'],
        },
      ],
      curly: ['error', 'all'],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    },
  },
);
