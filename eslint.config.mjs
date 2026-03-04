import convexPlugin from "@convex-dev/eslint-plugin";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import nodePlugin from "eslint-plugin-n";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...convexPlugin.configs.recommended,
  prettier,
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    plugins: {
      n: nodePlugin,
    },
    rules: {
      "prefer-arrow-callback": ["error"],
      "prefer-template": ["error"],
      semi: ["error"],
      quotes: ["error", "double"],
      "n/no-process-env": ["error"],
    },
  },
  {
    files: ["src/convex/**/*.{ts,tsx,js,cjs,mjs}", "src/env.ts"],
    rules: {
      "n/no-process-env": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/convex/_generated",
    ".agents/skills",
  ]),
]);
