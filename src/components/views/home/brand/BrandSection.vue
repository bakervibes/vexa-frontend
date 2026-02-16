<script setup lang="ts">
import AutoScroll from '@/components/custom/auto-scroll.vue'
import { h } from 'vue'

const brands = Array.from({ length: 7 }, (_, i) =>
  h('img', {
    src: `/brands/${i + 1}.jpg`,
    alt: `Brand ${i + 1}`,
    class:
      'h-16 w-auto object-contain opacity-30 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 md:h-24',
  }),
)
</script>

<template>
  <section
    class="border-border-noir flex w-full flex-col border-y bg-[#0D0D0D]"
  >
    <div
      class="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-16 md:flex-row md:items-center"
    >
      <div
        class="font-display text-text flex shrink-0 flex-col text-3xl leading-tight font-light md:text-5xl"
      >
        <span class="flex gap-3 whitespace-nowrap">
          <span>Simplement</span>
          <span class="text-gold italic">unique</span>
        </span>
        <span class="flex gap-3 whitespace-nowrap">
          <span>Simplement</span>
          <span class="text-gold italic">mieux</span>
        </span>
      </div>

      <div class="flex-1 text-sm leading-relaxed text-[#555] md:text-base">
        <span class="text-gold">Vexa</span>
        est une boutique premium spécialisée dans la sélection de produits
        d'exception. Qualité, élégance et satisfaction depuis 2019.
      </div>
    </div>

    <div class="border-border-noir border-t py-8">
      <AutoScroll
        :items="[...brands, ...brands]"
        :speed="1"
      />
    </div>
  </section>
</template>
