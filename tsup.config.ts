import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/lib/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // Disabled due to type resolution issues, users can import from source
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  minify: true,
});