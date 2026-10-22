/** @type {import("stylelint").Config} */
export default {
  reportInvalidScopeDisables: true,
  reportNeedlessDisables: true,
  reportUnscopedDisables: true,
  extends: [
    "stylelint-config-standard",
    "@maxmilton/stylelint-config",
    "@maxmilton/stylelint-config/xcss",
  ],
  rules: {
    "media-query-no-invalid": null,
  },
  ignoreFiles: ["dist/*", "node_modules/**"],
};
