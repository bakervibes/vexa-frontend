<script setup lang="ts">
import { SlidersHorizontalIcon } from 'lucide-vue-next'
import ShopFilter from './ShopFilter.vue'
import ShopHero from './ShopHero.vue'
import ShopList from './ShopList.vue'
</script>

<template>
  <ShopHero />

  <div
    class="container mx-auto flex w-full items-start gap-4 px-4 pt-6 pb-10 md:px-6"
  >
    <div
      class="sticky top-12 hidden h-fit max-h-[calc(100vh-120px)] w-full flex-col overflow-y-auto pr-10 md:top-24 lg:flex lg:w-3/10 xl:w-2/7"
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <h1 class="text-2xl font-bold">Filter</h1>
        <SlidersHorizontalIcon class="size-6 text-black/40" />
      </div>

      <ShopFilter />
    </div>

    <ShopList />
  </div>
</template>

<style scoped></style>
