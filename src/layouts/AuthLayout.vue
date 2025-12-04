<script setup lang="ts">
/**
 * AuthLayout
 * Minimal layout for authentication pages (SignIn, SignUp)
 * Without header or footer - clean design for authentication
 */
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50">
    <RouterView />
  </div>

  <Toaster
    richColors
    position="bottom-right"
    :duration="3000"
  />
</template>

<style scoped>
/* Authentication layout specific styles */
</style>
