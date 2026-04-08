import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs', 'iife'],
  globalName: 'durate',
  dts: true,
  clean: true,
  minify: true,
  target: 'es2020',
  outDir: 'dist',
});
