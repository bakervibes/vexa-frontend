<script setup lang="ts">
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import { ref, watchEffect } from 'vue'
import HeroSection1 from './HeroSection1.vue'
import HeroSection2 from './HeroSection2.vue'

const heroSections = [{ component: HeroSection1 }, { component: HeroSection2 }]

const emblaApi = ref<CarouselApi>()
const currentIndex = ref(0)

watchEffect(() => {
  if (!emblaApi.value) return

  emblaApi.value.on('select', () => {
    currentIndex.value = emblaApi.value?.selectedScrollSnap() ?? 0
  })
})

const goToPrevious = () => {
  emblaApi.value?.scrollPrev()
}

const goToNext = () => {
  emblaApi.value?.scrollNext()
}

const goToSlide = (index: number) => {
  emblaApi.value?.scrollTo(index)
}
</script>

<template>
  <section class="relative">
    <Carousel
      @init-api="(val) => (emblaApi = val)"
      class="w-full"
      :opts="{
        loop: true,
      }"
    >
      <CarouselContent>
        <CarouselItem
          v-for="(section, index) in heroSections"
          :key="index"
          :with-gap="false"
        >
          <component :is="section.component" />
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
          v-for="index in heroSections.length"
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
