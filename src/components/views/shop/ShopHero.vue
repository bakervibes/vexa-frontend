<script setup lang="ts">
import { ChevronRightIcon } from 'lucide-vue-next'
</script>

<template>
  <section
    class="relative flex h-[calc(100vh-3rem)] flex-col justify-start text-black md:h-[calc(100vh-4rem)] md:flex-row"
  >
    <!-- IMAGE EN BACKGROUND SUR DESKTOP, EN BLOC SUR MOBILE -->
    <div class="absolute inset-0 h-full w-full overflow-hidden">
      <img
        src="/shop/shop-bg.png"
        alt="Shop Background"
        class="hidden h-full w-full object-cover md:block"
      />
      <img
        src="/shop/shop-bg-mobile.png"
        alt="Shop Background Mobile"
        class="block h-full w-full object-cover md:hidden"
      />
    </div>

    <!-- CONTENU -->
    <div
      class="relative z-10 flex h-full w-full flex-col justify-center gap-8 px-6 pb-12 md:px-24 md:pb-0"
    >
      <div class="flex flex-col items-center justify-center gap-8">
        <div class="flex items-center gap-4">
          <RouterLink
            to="/"
            class="w-fit px-4 text-black/80 transition-all hover:font-medium hover:text-black"
          >
            Home
          </RouterLink>

          <ChevronRightIcon
            :size="16"
            class="text-black/40"
          />

          <RouterLink
            to="/shop"
            class="w-fit px-4 text-black/80 transition-all hover:font-medium hover:text-black"
          >
            Shop
          </RouterLink>
        </div>

        <h1 class="text-center text-3xl font-black md:text-6xl">Shop page</h1>

        <p class="text-center text-base md:text-start md:text-lg">
          Let's design the place you always imagined.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
