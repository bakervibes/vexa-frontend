import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [vue()],
    test: {
      globals: true,
      environment: 'happy-dom',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'e2e'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules',
          'dist',
          '**/*.d.ts',
          '**/*.config.*',
          '**/types/**',
          'src/main.ts',
        ],
      },
      setupFiles: ['./src/__tests__/setup.ts'],
    },
  }),
)
