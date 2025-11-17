<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-gray-200">404</h1>
      <h2 class="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
      <p class="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
      <RouterLink
        to="/"
        class="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Go back home
      </RouterLink>
    </div>
  </div>
</template>

<style scoped></style>
