const config = {
  extends: ['stylelint-config-standard'],
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx,mjs}'],
      customSyntax: 'postcss-styled-syntax',
      rules: {
        'nesting-selector-no-missing-scoping-root': null,
        'declaration-empty-line-before': null,
      },
    },
  ],
};

export default config;
