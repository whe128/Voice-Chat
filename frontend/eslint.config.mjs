// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import storybook from 'eslint-plugin-storybook';
import {
  config as tseslintConfig,
  configs as tseslintConfigs,
  parser as tseslintParser,
} from 'typescript-eslint';
import eslint from '@eslint/js';
import pluginPromise from 'eslint-plugin-promise';
import stylistic from '@stylistic/eslint-plugin';
import cspellPlugin from '@cspell/eslint-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    rules: {
      'arrow-body-style': 'error',
      'curly': ['error', 'all'],
      'no-restricted-globals': ['error', 'React'],
      'object-shorthand': 'error',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-boolean-value': [
        'error',
        'never',
        {
          assumeUndefinedIsFalse: true,
        },
      ],
      'react/jsx-curly-brace-presence': 'error',
      'react/require-default-props': [
        'error',
        {
          functions: 'defaultArguments',
        },
      ],
      'react/self-closing-comp': [
        'error',
        {
          component: true,
          html: true,
        },
      ],
    },
  },
  ...tseslintConfig(
    eslint.configs.recommended,
    tseslintConfigs.recommendedTypeChecked,
    tseslintConfigs.stylisticTypeChecked,
    {
      languageOptions: {
        parser: tseslintParser,
        parserOptions: {
          projectService: true,
        },
      },
    },
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
      },
    },
    {
      files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
      extends: [tseslintConfigs.disableTypeChecked],
    },
  ),
  {
    plugins: {
      promise: pluginPromise,
    },
    rules: {
      ...pluginPromise.configs['flat/recommended'].rules,
      'promise/prefer-await-to-then': 'error',
    },
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'never', prev: 'import', next: 'import' },
        { blankLine: 'always', prev: 'interface', next: '*' },
        { blankLine: 'always', prev: '*', next: 'type' },
        { blankLine: 'always', prev: 'type', next: '*' },
        { blankLine: 'always', prev: '*', next: 'return' },
        { blankLine: 'always', prev: '*', next: 'export' },
      ],
    },
  },
  ...compat.config({
    extends: ['plugin:import/recommended', 'plugin:import/typescript'],
    settings: {
      'import/resolver': {
        typescript: true,
      },
      'rules': {
        'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
        'import/no-duplicates': 'error',
        'import/order': [
          'error',
          {
            'newlines-between': 'never',
            'pathGroups': [
              {
                pattern: '@/**',
                group: 'external',
                position: 'after',
              },
            ],
          },
        ],
        'import/prefer-default-export': 'error',
      },
    },
  }),
  {
    plugins: {
      '@cspell': cspellPlugin,
    },
    rules: {
      '@cspell/spellchecker': [
        'error',
        {
          configFile: fileURLToPath(
            new URL('cspell.config.yaml', import.meta.url),
          ),
        },
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
