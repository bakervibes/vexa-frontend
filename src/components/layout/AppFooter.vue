<script setup lang="ts">
import { env } from '@/env'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-gray-800 text-white">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div class="text-center md:text-left">
          <p class="text-sm text-gray-400">
            © {{ currentYear }} {{ env.VITE_APP_NAME }}. All rights reserved.
          </p>
        </div>

        <div class="flex items-center space-x-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-gray-400 transition-colors hover:text-white"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Twitter
          </a>
          <a
            href="mailto:contact@example.com"
            class="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
