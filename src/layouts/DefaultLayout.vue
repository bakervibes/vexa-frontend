<script setup lang="ts">
import AppFooter from '@/components/common/AppFooter.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import NewsLetter from '@/components/views/home/newsletters/NewsLetters.vue'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="bg-noir flex min-h-screen flex-col">
    <AppHeader />

    <main
      id="main-content"
      class="mt-16 flex-1 sm:mt-18"
      tabindex="-1"
    >
      <RouterView />
    </main>

    <NewsLetter />

    <AppFooter />

    <Toaster
      richColors
      position="bottom-right"
      :duration="3000"
    />
  </div>
</template>
