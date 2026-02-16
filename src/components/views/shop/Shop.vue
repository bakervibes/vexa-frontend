<script setup lang="ts">
import { SlidersHorizontalIcon } from 'lucide-vue-next'
import ShopFilter from './ShopFilter.vue'
import ShopHero from './ShopHero.vue'
import ShopList from './ShopList.vue'
</script>

<template>
  <ShopHero />

  <div class="mx-auto flex w-full max-w-6xl items-start gap-8 px-6 py-16">
    <div
      class="sticky top-24 hidden h-fit max-h-[calc(100vh-120px)] w-full flex-col overflow-y-auto lg:flex lg:w-3/10 xl:w-2/7"
    >
      <div class="mb-8 flex items-center justify-between gap-3">
        <h1 class="font-display text-text text-2xl font-light">Filtres</h1>
        <SlidersHorizontalIcon class="text-gold size-5" />
      </div>

      <div class="bg-gold/40 h-px w-24" />

      <ShopFilter />
    </div>

    <ShopList />
  </div>
</template>
