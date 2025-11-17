<script setup lang="ts">
import { env, isDevelopment } from './env'

console.log('🚀 Application:', env.VITE_APP_NAME, 'v' + env.VITE_APP_VERSION)
console.log('🌍 Environment:', env.VITE_ENV)
console.log('🔗 API URL:', env.VITE_API_URL)
console.log('⏱️  API Timeout:', env.VITE_API_TIMEOUT, 'ms')
console.log('🛠️  Dev Tools:', env.VITE_ENABLE_DEV_TOOLS ? 'Enabled' : 'Disabled')
console.log('📊 Analytics:', env.VITE_ENABLE_ANALYTICS ? 'Enabled' : 'Disabled')
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-4 text-4xl font-bold text-gray-900">{{ env.VITE_APP_NAME }}</h1>
      <p class="mb-8 text-gray-600">Version {{ env.VITE_APP_VERSION }}</p>

      <div class="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 class="mb-4 text-2xl font-semibold text-gray-800">Environment Configuration</h2>
        <dl class="space-y-3">
          <div class="flex">
            <dt class="w-48 font-medium text-gray-700">Environment:</dt>
            <dd class="text-gray-900">
              <span
                :class="{
                  'rounded bg-green-100 px-2 py-1 text-green-800': env.VITE_ENV === 'production',
                  'rounded bg-yellow-100 px-2 py-1 text-yellow-800': env.VITE_ENV === 'staging',
                  'rounded bg-blue-100 px-2 py-1 text-blue-800': env.VITE_ENV === 'development',
                }"
              >
                {{ env.VITE_ENV }}
              </span>
            </dd>
          </div>
          <div class="flex">
            <dt class="w-48 font-medium text-gray-700">API URL:</dt>
            <dd class="text-gray-900">{{ env.VITE_API_URL }}</dd>
          </div>
          <div class="flex">
            <dt class="w-48 font-medium text-gray-700">API Timeout:</dt>
            <dd class="text-gray-900">{{ env.VITE_API_TIMEOUT }}ms</dd>
          </div>
          <div class="flex">
            <dt class="w-48 font-medium text-gray-700">Dev Tools:</dt>
            <dd class="text-gray-900">
              <span v-if="env.VITE_ENABLE_DEV_TOOLS" class="text-green-600">✓ Enabled</span>
              <span v-else class="text-red-600">✗ Disabled</span>
            </dd>
          </div>
          <div class="flex">
            <dt class="w-48 font-medium text-gray-700">Analytics:</dt>
            <dd class="text-gray-900">
              <span v-if="env.VITE_ENABLE_ANALYTICS" class="text-green-600">✓ Enabled</span>
              <span v-else class="text-red-600">✗ Disabled</span>
            </dd>
          </div>
        </dl>
      </div>

      <div v-if="isDevelopment" class="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-6">
        <h3 class="mb-2 text-lg font-semibold text-yellow-800">⚠️ Development Mode</h3>
        <p class="text-yellow-700">
          You are running in development mode. Check the console for detailed logs.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
