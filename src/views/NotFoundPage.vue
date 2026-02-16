<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center px-6">
    <div class="text-center">
      <div class="text-gold mb-6 text-xs tracking-[0.3em] uppercase">
        Erreur
      </div>

      <h1 class="font-display text-gold text-8xl font-light md:text-9xl">
        404
      </h1>

      <div class="bg-gold/60 mx-auto my-8 h-px w-16" />

      <h2 class="font-display text-text text-3xl font-light md:text-4xl">
        Page
        <span class="italic">introuvable</span>
      </h2>

      <p class="mx-auto mt-6 max-w-md text-sm leading-relaxed text-[#555]">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>

      <div
        class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <RouterLink
          to="/"
          class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-8 py-4 text-xs tracking-[0.2em] uppercase transition-all"
        >
          Retour à l'accueil
        </RouterLink>
        <RouterLink
          to="/shop"
          class="hover:border-gold/40 hover:text-gold border-border-noir border px-8 py-4 text-xs tracking-[0.2em] text-[#555] uppercase transition-all"
        >
          Voir la boutique
        </RouterLink>
      </div>
    </div>
  </div>
</template>
