<script setup lang="ts">
import type { CarouselApi } from '@/components/ui/carousel'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import { ref } from 'vue'
import HeroSection1 from './HeroSection1.vue'
import HeroSection2 from './HeroSection2.vue'

const carouselApi = ref<CarouselApi>()
const currentIndex = ref(0)

function onCarouselInit(api: CarouselApi) {
  carouselApi.value = api

  api?.on('select', () => {
    currentIndex.value = api.selectedScrollSnap()
  })
}

function goToPrevious() {
  carouselApi.value?.scrollPrev()
}

function goToNext() {
  carouselApi.value?.scrollNext()
}

function goToSlide(index: number) {
  carouselApi.value?.scrollTo(index)
}
</script>

<template>
  <section class="relative">
    <Carousel
      @init-api="onCarouselInit"
      :opts="{
        align: 'start',
        loop: true,
      }"
    >
      <CarouselContent>
        <CarouselItem :with-gap="false">
          <HeroSection1 />
        </CarouselItem>
        <CarouselItem :with-gap="false">
          <HeroSection2 />
        </CarouselItem>
      </CarouselContent>
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
