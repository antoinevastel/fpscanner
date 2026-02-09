import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  define: {
    // Inject encryption key from environment variable, fallback to default for development
    __FP_ENCRYPTION_KEY__: JSON.stringify(
      process.env.FP_ENCRYPTION_KEY || 'my-shared-secret'
    ),
  },
  server: {
    port: 3000,
    open: '/test/dev-source.html',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FingerprintScanner',
      fileName: (format) => `fpScanner.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        exports: 'named',
      },
    },
    outDir: 'dist',
    sourcemap: false, // Disable source maps for production builds
  },
  test: {
    globals: true,
    environment: 'node',
  },
});

