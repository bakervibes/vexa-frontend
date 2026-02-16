<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="bg-noir flex min-h-screen items-center justify-center px-6">
    <RouterView />
  </div>

  <Toaster
    richColors
    position="bottom-right"
    :duration="3000"
  />
</template>
