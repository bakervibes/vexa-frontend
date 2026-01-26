import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Optimisation du bundle
    rollupOptions: {
      output: {
        // Code splitting manuel pour les vendors
        manualChunks: {
          // Core Vue ecosystem
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          // Data fetching
          'vendor-query': ['@tanstack/vue-query', 'axios'],
          // UI Components
          'vendor-ui': [
            'radix-vue',
            'reka-ui',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],
          // Forms & Validation
          'vendor-forms': ['vee-validate', 'zod', '@vee-validate/zod'],
          // Icons
          'vendor-icons': ['lucide-vue-next'],
        },
      },
    },
    // Augmenter la limite d'avertissement (les vendors sont gros)
    chunkSizeWarningLimit: 600,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
