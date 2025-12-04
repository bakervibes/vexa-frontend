<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section
    class="relative flex h-[calc(100vh-3rem)] flex-col justify-start text-white md:h-[calc(100vh-4rem)] md:flex-row"
  >
    <!-- IMAGE EN BACKGROUND SUR DESKTOP, EN BLOC SUR MOBILE -->
    <div class="absolute inset-0 h-full w-full overflow-hidden">
      <img
        src="/hero/hero-2.png"
        alt="Hero Section 2"
        class="hidden h-full w-full object-cover md:block"
      />
      <img
        src="/hero/hero-2-mobile.png"
        alt="Hero Section 2 Mobile"
        class="block h-full w-full object-cover md:hidden"
      />
    </div>

    <!-- CONTENU -->
    <div
      class="relative z-10 flex h-full w-full flex-col justify-end gap-8 px-6 pb-12 md:w-1/2 md:justify-center md:px-24 md:pb-0"
    >
      <div
        class="flex flex-col items-center justify-center gap-4 md:items-start"
      >
        <h1 class="text-center text-3xl font-black md:text-start md:text-6xl">
          More than
          <br />
          just a game.
          <br />
          It's a lifestyle
        </h1>

        <p class="text-center text-base md:text-start md:text-lg">
          Whether you're just starting out, have played your whole life or
          you're a Tour pro, your swing is like a fingerprint.
        </p>

        <RouterLink
          to="/shop"
          class="w-fit rounded-lg bg-[#38CB89] px-8 py-3 font-medium text-white transition-all hover:bg-[#38CB89]/80 hover:shadow-lg md:text-black"
        >
          Shopping Now
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
