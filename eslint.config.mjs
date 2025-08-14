import js from "@eslint/js";
import mm from "@maxmilton/eslint-config";
import unicorn from "eslint-plugin-unicorn";
import ts from "typescript-eslint";

const OFF = 0;
const ERROR = 2;

export default ts.config(
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  mm.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: ERROR,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-plusplus": OFF, // byte savings
      quotes: [ERROR, "double", { avoidEscape: true }],
      "unicorn/prefer-add-event-listener": OFF,
      "unicorn/prefer-at": OFF, // bad browser support
      "unicorn/prefer-dom-node-append": OFF,
      "unicorn/prefer-global-this": OFF, // prefer to clearly separate Bun and DOM
      "unicorn/prefer-query-selector": OFF,
      "unicorn/switch-case-braces": [ERROR, "avoid"], // byte savings
    },
  },
  { ignores: ["coverage", "dist"] },
);
