<script setup lang="ts">
import { ChevronRightIcon } from 'lucide-vue-next'
</script>

<template>
  <section
    class="text-text bg-noir relative flex min-h-[50vh] flex-col items-center justify-center px-6"
  >
    <div class="flex flex-col items-center justify-center gap-8">
      <div class="flex items-center gap-3">
        <RouterLink
          to="/"
          class="hover:text-gold text-xs tracking-widest text-[#555] uppercase transition-colors"
        >
          Accueil
        </RouterLink>

        <ChevronRightIcon
          :size="12"
          class="text-[#555]"
        />

        <RouterLink
          to="/shop"
          class="text-gold text-xs tracking-widest uppercase"
        >
          Boutique
        </RouterLink>
      </div>

      <div class="text-gold mb-6 text-xs tracking-[0.3em] uppercase">
        Collection
      </div>

      <h1
        class="font-display text-center text-5xl font-light md:text-6xl lg:text-7xl"
      >
        Notre
        <span class="italic">boutique</span>
      </h1>

      <div class="bg-gold/60 mx-auto my-8 h-px w-16" />

      <p
        class="mx-auto max-w-lg text-center text-sm leading-relaxed text-[#555] md:text-base"
      >
        Découvrez notre sélection exclusive de produits premium.
      </p>
    </div>
  </section>
</template>
