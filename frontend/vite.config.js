import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/**',
        'src/pages/**',
        'src/services/**',
      ],
      exclude: [
        'node_modules/**',
        'src/tests/**',
        'src/setupTests.js',
        'src/main.jsx',
        'src/App.jsx',
        '**/*.config.*',
        '**/dist/**',
      ],
    },
  },
});
