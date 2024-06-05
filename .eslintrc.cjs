const OFF = 0;
const WARN = 1;
const ERROR = 2;

/** @type {import('eslint/lib/shared/types').ConfigData & { parserOptions: import('@typescript-eslint/types').ParserOptions }} */
module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json', 'tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:unicorn/recommended',
    'plugin:security/recommended-legacy',
  ],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': ERROR,
    '@typescript-eslint/no-non-null-assertion': WARN,
    'import/prefer-default-export': OFF,
    'no-restricted-syntax': OFF,
    'no-void': OFF,
    'unicorn/filename-case': OFF,
    'unicorn/import-style': WARN,
    'unicorn/no-abusive-eslint-disable': WARN,
    'unicorn/no-null': OFF,
    'unicorn/prefer-module': OFF,
    'unicorn/prefer-node-protocol': OFF,
    // poor browser compatibility
    'unicorn/prefer-string-replace-all': OFF,
    'unicorn/prevent-abbreviations': OFF,
    // byte savings (esbuild minify doesn't currently automatically remove)
    'unicorn/switch-case-braces': [ERROR, 'avoid'],

    /* Covered by biome formatter */
    '@typescript-eslint/indent': OFF,
    'function-paren-newline': OFF,
    'implicit-arrow-linebreak': OFF,
    'max-len': OFF,
    'object-curly-newline': OFF,
    'operator-linebreak': OFF,
    'unicorn/no-nested-ternary': OFF,

    /* stage1 */
    '@typescript-eslint/consistent-type-definitions': OFF, // FIXME: Issue with stage1 collect Refs
    // underscores in synthetic event handler names
    'no-underscore-dangle': OFF,
    'unicorn/prefer-add-event-listener': OFF,
    'unicorn/prefer-dom-node-append': OFF,
    'unicorn/prefer-query-selector': OFF,
  },
  overrides: [
    {
      files: ['*.spec.ts', '*.test.ts', '*.d.ts', '*.config.ts', 'build.ts'],
      rules: {
        'import/no-extraneous-dependencies': OFF,
      },
    },
  ],
};
