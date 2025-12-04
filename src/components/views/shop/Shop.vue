<script setup lang="ts">
import { SlidersHorizontalIcon } from 'lucide-vue-next'
import ShopFilter from './ShopFilter.vue'
import ShopHero from './ShopHero.vue'
import ShopList from './ShopList.vue'
</script>

<template>
  <ShopHero />

  <div class="mx-auto flex w-full max-w-6xl gap-10 px-4 py-6 md:px-6">
    <div class="hidden w-full flex-col lg:flex lg:w-1/4">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-2xl font-bold">Filter</h1>
        <SlidersHorizontalIcon class="size-6 text-black/40" />
      </div>

      <ShopFilter />
    </div>

    <ShopList />
  </div>
</template>

<style scoped></style>
