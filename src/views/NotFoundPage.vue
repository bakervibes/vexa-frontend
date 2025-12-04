<script setup lang="ts">
/**
 * NotFoundPage (404)
 * 404 error page - uses DefaultLayout
 */
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center px-4">
    <div class="text-center">
      <h1 class="text-9xl font-black text-gray-200">404</h1>
      <h2 class="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
      <p class="mt-4 text-gray-600">
        Sorry, the page you are looking for does not exist.
      </p>
      <div class="mt-8 flex justify-center gap-4">
        <RouterLink
          to="/"
          class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Back to home
        </RouterLink>
        <RouterLink
          to="/shop"
          class="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          View shop
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
