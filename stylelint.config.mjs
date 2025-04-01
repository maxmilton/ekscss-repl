/** @type {import('stylelint').Config} */
export default {
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  extends: ['stylelint-config-standard', '@maxmilton/stylelint-config'],
  ignoreFiles: ['*.bak/**', 'dist/**', 'node_modules/**'],
  rules: {
    'function-no-unknown': null,
    'import-notation': null,
    'media-query-no-invalid': null,
  },
};
