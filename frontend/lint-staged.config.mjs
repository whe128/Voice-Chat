import path from 'path';

const buildEslintCommand = (filenames) =>
  `eslint --max-warnings 0 ${filenames
    .map((f) => `"${path.relative(process.cwd(), f)}"`)
    .join(' ')}`;

const config = {
  '**/*': ['prettier --check --ignore-unknown'],
  '**/*.{ts, tsx, js, jsx, mjs, css}': ['stylelint'],
  '**/*.{ts, tsx, js, jsx, mjs}': [buildEslintCommand],
  '**/*.{ts, tsx}': [() => 'tsc --noEmit'],
};

export default config;
