import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Browser profiles captured during local visual QA contain vendored
    // extension scripts and should not be linted as project source.
    "qa-artifacts/**/chrome-profile-*/**",
    "qa-artifacts/**/chrome-debug-profile-*/**",
  ]),
]);

export default eslintConfig;
