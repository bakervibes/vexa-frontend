<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import Carousel from 'primevue/carousel'
import { ref } from 'vue'
import HeroSection1 from './HeroSection1.vue'
import HeroSection2 from './HeroSection2.vue'

const currentIndex = ref(0)
const heroSections = ref([
  { component: HeroSection1 },
  { component: HeroSection2 },
])

const responsiveOptions = ref([
  {
    breakpoint: '1024px',
    numVisible: 1,
    numScroll: 1,
  },
])

const onPageChange = (event: { page: number }) => {
  currentIndex.value = event.page
}

const goToPrevious = () => {
  const newIndex = currentIndex.value === 0 ? 1 : currentIndex.value - 1
  currentIndex.value = newIndex
}

const goToNext = () => {
  const newIndex = currentIndex.value === 1 ? 0 : currentIndex.value + 1
  currentIndex.value = newIndex
}

const goToSlide = (index: number) => {
  currentIndex.value = index
}
</script>

<template>
  <section class="relative">
    <Carousel
      :value="heroSections"
      :numVisible="1"
      :numScroll="1"
      :circular="true"
      :autoplayInterval="5000"
      :page="currentIndex"
      @update:page="onPageChange"
      :showIndicators="false"
      :showNavigators="false"
      :responsiveOptions="responsiveOptions"
    >
      <template #item="slotProps">
        <component :is="slotProps.data.component" />
      </template>
    </Carousel>

    <div
      class="absolute top-1/2 right-0 left-0 z-20 flex -translate-y-1/2 justify-between px-4 text-white/40 hover:text-white/60"
    >
      <button
        @click="goToPrevious"
        class="cursor-pointer rounded-full p-2"
      >
        <ChevronLeftIcon />
      </button>
      <button
        @click="goToNext"
        class="cursor-pointer rounded-full p-2"
      >
        <ChevronRightIcon />
      </button>
    </div>

    <div class="absolute right-0 bottom-4 left-0 z-20">
      <div class="flex justify-center gap-2">
        <div
          v-for="index in 2"
          :key="index"
          :class="[
            'h-3 cursor-pointer rounded-full bg-gray-200 transition-all duration-300 hover:scale-110',
            currentIndex === index - 1 ? 'w-10' : 'w-3',
          ]"
          @click="goToSlide(index - 1)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped></style>
