<script setup lang="ts">
/**
 * DefaultLayout
 * Main layout for public/user pages
 * Includes header and footer
 */
import AppFooter from '@/components/common/AppFooter.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import NewsLetter from '@/components/views/home/newsletter/NewsLetter.vue'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="flex flex-col">
    <div class="flex min-h-screen flex-col">
      <AppHeader />

      <main class="mt-16 flex-1 sm:mt-18">
        <RouterView />
      </main>
    </div>

    <NewsLetter />

    <AppFooter />

    <Toaster
      richColors
      position="bottom-right"
      :duration="3000"
    />
  </div>
</template>

<style scoped>
/* Default layout specific styles */
</style>
