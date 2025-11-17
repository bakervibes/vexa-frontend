<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { env } from '@/env'

const navigation = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
]
</script>

<template>
  <header class="bg-white shadow">
    <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center space-x-2">
            <span class="text-xl font-bold text-gray-900">{{ env.VITE_APP_NAME }}</span>
            <span class="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
              v{{ env.VITE_APP_VERSION }}
            </span>
          </RouterLink>
        </div>

        <div class="flex items-center space-x-4">
          <RouterLink
            v-for="item in navigation"
            :key="item.path"
            :to="item.path"
            class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            active-class="bg-gray-100 text-gray-900"
          >
            {{ item.name }}
          </RouterLink>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped></style>
