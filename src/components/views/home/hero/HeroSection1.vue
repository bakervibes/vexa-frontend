<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section
    class="text-text relative flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center"
  >
    <div class="text-gold mb-4 text-xs tracking-[0.3em] uppercase">
      Collection Exclusive
    </div>

    <h1
      class="font-display mx-auto max-w-4xl text-5xl leading-[1.1] font-light md:text-7xl lg:text-8xl"
    >
      L'art du
      <br />
      <span class="text-gold italic">commerce</span>
      <br />
      premium
    </h1>

    <div class="bg-gold/60 mx-auto my-6 h-px w-16" />

    <p
      class="mx-auto max-w-lg text-sm leading-relaxed text-[#555] md:text-base"
    >
      Découvrez notre sélection de produits d'exception.
    </p>

    <RouterLink
      to="/shop"
      class="border-gold/40 text-gold hover:bg-gold hover:text-noir mt-6 border px-8 py-3 text-xs tracking-[0.2em] uppercase transition-all"
    >
      Explorer la boutique
    </RouterLink>
  </section>
</template>
