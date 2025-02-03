import pluginJs from "@eslint/js"
import globals from "globals"

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: 12, // ECMAScript 2021 support
      sourceType: "module", // Enable ES6 modules (import/export)
      globals: {
        ...globals.node, // Enable Node.js global variables
      },
    },
    rules: {
      semi: ["error", "never"], // Example: no semicolons
      "no-console": "off", // Allow console statements in Node.js environment
    },
  },
  pluginJs.configs.recommended, // Recommended rules from ESLint
]
