<script setup lang="ts">
import ListScroll from '@/components/custom/list-scroll.vue'
import { h } from 'vue'

const brands = Array.from({ length: 7 }, (_, i) =>
  h('img', {
    src: `/brands/${i + 1}.jpg`,
    alt: `Brand ${i + 1}`,
    class:
      'h-24 w-auto object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 md:h-32',
  }),
)
</script>

<template>
  <section class="flex w-full flex-col">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-4 p-6 md:flex-row md:items-center"
    >
      <div
        class="flex shrink-0 flex-col text-4xl leading-tight font-black md:text-6xl"
      >
        <span class="flex whitespace-nowrap">
          <span>Simply Unique</span>
          <span class="font-medium text-black/50">/</span>
        </span>
        <span class="flex whitespace-nowrap">
          <span>Simply Better</span>
          <span class="font-medium text-black/50">.</span>
        </span>
      </div>

      <div class="flex-1 text-base sm:px-10 md:text-lg">
        <span class="font-black">Vexa</span>
        is a gift & decorations store based in HCMC, Vietnam. Est since 2019.
      </div>
    </div>

    <ListScroll
      :items="[...brands, ...brands]"
      position="center"
    />
  </section>
</template>

<style scoped></style>
