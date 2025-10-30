import js from "@eslint/js";
import mm from "@maxmilton/eslint-config";
import unicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";

export default defineConfig(
  js.configs.recommended,
  ts.configs.strictTypeChecked,
  ts.configs.stylisticTypeChecked,
  // @ts-expect-error - broken upstream types
  unicorn.configs.recommended,
  mm.configs.recommended,
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-plusplus": "off", // byte savings
      "unicorn/prefer-add-event-listener": "off",
      "unicorn/prefer-at": "off", // bad browser support
      "unicorn/prefer-dom-node-append": "off",
      "unicorn/prefer-global-this": "off", // prefer to clearly separate Bun and DOM
      "unicorn/prefer-query-selector": "off",
      "unicorn/switch-case-braces": ["error", "avoid"], // byte savings
    },
  },
  { ignores: ["coverage", "dist"] },
);
