<script setup lang="ts">
import { env, isDevelopment, isProduction, isStaging } from '@/env'
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">About</h1>
      <p class="mt-2 text-gray-600">Learn more about this application and its configuration.</p>
    </div>

    <!-- Application Info -->
    <div class="mb-8 rounded-lg bg-white p-6 shadow">
      <h2 class="mb-4 text-xl font-semibold text-gray-800">Application Information</h2>
      <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-sm font-medium text-gray-500">Name</dt>
          <dd class="mt-1 text-lg text-gray-900">{{ env.VITE_APP_NAME }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Version</dt>
          <dd class="mt-1 text-lg text-gray-900">{{ env.VITE_APP_VERSION }}</dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">Environment</dt>
          <dd class="mt-1">
            <span
              :class="{
                'rounded bg-green-100 px-2 py-1 text-sm font-medium text-green-800': isProduction,
                'rounded bg-yellow-100 px-2 py-1 text-sm font-medium text-yellow-800': isStaging,
                'rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800': isDevelopment,
              }"
            >
              {{ env.VITE_ENV }}
            </span>
          </dd>
        </div>
        <div>
          <dt class="text-sm font-medium text-gray-500">API URL</dt>
          <dd class="mt-1 text-sm text-gray-900">{{ env.VITE_API_URL }}</dd>
        </div>
      </dl>
    </div>

    <!-- Features -->
    <div class="mb-8 rounded-lg bg-white p-6 shadow">
      <h2 class="mb-4 text-xl font-semibold text-gray-800">Features</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              ✓
            </span>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Vue 3 + TypeScript</h3>
            <p class="text-sm text-gray-500">Modern framework with full type safety</p>
          </div>
        </div>

        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              ✓
            </span>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Vue Router</h3>
            <p class="text-sm text-gray-500">Client-side routing with lazy loading</p>
          </div>
        </div>

        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              ✓
            </span>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">TanStack Query</h3>
            <p class="text-sm text-gray-500">Powerful data fetching and caching</p>
          </div>
        </div>

        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              ✓
            </span>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Zod Validation</h3>
            <p class="text-sm text-gray-500">Type-safe environment variables</p>
          </div>
        </div>

        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              ✓
            </span>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">ESLint + Prettier</h3>
            <p class="text-sm text-gray-500">Code quality and formatting</p>
          </div>
        </div>

        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              ✓
            </span>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Husky + lint-staged</h3>
            <p class="text-sm text-gray-500">Git hooks for quality checks</p>
          </div>
        </div>

        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              ✓
            </span>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Tailwind CSS</h3>
            <p class="text-sm text-gray-500">Utility-first CSS framework</p>
          </div>
        </div>

        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600"
            >
              ✓
            </span>
          </div>
          <div>
            <h3 class="font-medium text-gray-900">Type-Safe API</h3>
            <p class="text-sm text-gray-500">Fully typed API utility functions</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Development Info -->
    <div v-if="isDevelopment" class="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-6">
      <h3 class="mb-2 text-lg font-semibold text-yellow-800">🛠️ Development Mode</h3>
      <div class="space-y-2 text-sm text-yellow-700">
        <p><strong>API Timeout:</strong> {{ env.VITE_API_TIMEOUT }}ms</p>
        <p><strong>Dev Tools:</strong> {{ env.VITE_ENABLE_DEV_TOOLS ? 'Enabled' : 'Disabled' }}</p>
        <p><strong>Analytics:</strong> {{ env.VITE_ENABLE_ANALYTICS ? 'Enabled' : 'Disabled' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
