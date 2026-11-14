import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // App Router root layouts render <head> directly; the rule is for the Pages Router.
    rules: { '@next/next/no-head-element': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts', '.screens/**', '.lighthouse/**']),
]);
