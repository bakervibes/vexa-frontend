<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section
    class="relative flex h-[calc(100vh-3rem)] flex-col justify-start text-black md:h-[calc(100vh-4rem)] md:flex-row md:justify-end"
  >
    <!-- IMAGE EN BACKGROUND SUR DESKTOP, EN BLOC SUR MOBILE -->
    <div class="absolute inset-0 h-full w-full overflow-hidden">
      <img
        src="/hero/hero-3.png"
        alt="Hero Section 3"
        class="hidden h-full w-full object-cover md:block"
      />
      <img
        src="/hero/hero-3-mobile.png"
        alt="Hero Section 3 Mobile"
        class="block h-full w-full object-cover md:hidden"
      />
    </div>

    <!-- CONTENU -->
    <div
      class="relative z-10 flex h-full w-full flex-col justify-start gap-8 px-12 pt-8 md:w-1/2 md:justify-center md:px-20 md:pt-0"
    >
      <div
        class="flex flex-col items-center justify-center gap-4 md:items-start"
      >
        <h1 class="text-center text-3xl font-black md:text-start md:text-6xl">
          Listen to
          <br />
          the
          <span class="font-medium text-blue-600">amazing</span>
          <br />
          music sound.
        </h1>

        <p class="text-center text-base md:text-start md:text-lg">
          Experience music like never before
        </p>

        <RouterLink
          to="/shop"
          class="w-fit rounded-lg bg-black px-8 py-3 font-medium text-white transition-all hover:bg-black/80 hover:shadow-lg"
        >
          Shopping Now
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
