const OFF = 0;
const WARN = 1;

// TODO: Types
// eslint-disable-next-line max-len
// /** @type {import('eslint/lib/shared/types').ConfigData & { parserOptions: import('@typescript-eslint/types').ParserOptions }} */
module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // FIXME: Remove once TS 4.6+ is released and typescript-eslint has support
    //  ↳ https://github.com/typescript-eslint/typescript-eslint/issues/3950
    extraFileExtensions: ['.mjs', '.cjs'],
    project: ['./test/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:unicorn/recommended',
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': WARN,
    '@typescript-eslint/no-use-before-define': WARN,
    '@typescript-eslint/restrict-template-expressions': WARN,
    'import/prefer-default-export': OFF,
    'no-restricted-syntax': OFF,
    // stage1 uses underscores in synthetic event handler names
    'no-underscore-dangle': OFF,
    'no-void': OFF,
    'unicorn/filename-case': OFF,
    'unicorn/no-abusive-eslint-disable': WARN,
    'unicorn/no-null': OFF,
    'unicorn/prefer-add-event-listener': OFF,
    'unicorn/prefer-dom-node-append': OFF,
    'unicorn/prefer-module': OFF,
    'unicorn/prefer-node-protocol': OFF,
    'unicorn/prefer-query-selector': OFF,
    'unicorn/prevent-abbreviations': OFF,
  },
};
