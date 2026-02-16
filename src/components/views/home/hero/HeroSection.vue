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
  <section class="bg-noir relative">
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
      class="hover:text-gold absolute top-1/2 right-0 left-0 z-20 flex -translate-y-1/2 justify-between px-4 text-[#555]"
    >
      <button
        @click="goToPrevious"
        class="cursor-pointer p-2"
      >
        <ChevronLeftIcon class="size-6" />
      </button>
      <button
        @click="goToNext"
        class="cursor-pointer p-2"
      >
        <ChevronRightIcon class="size-6" />
      </button>
    </div>

    <div class="absolute right-0 bottom-8 left-0 z-20">
      <div class="flex justify-center gap-3">
        <div
          v-for="index in heroSections.length"
          :key="index"
          :class="[
            'bg-gold/30 hover:bg-gold h-px cursor-pointer transition-all duration-300',
            currentIndex === index - 1 ? 'bg-gold w-12' : 'w-6',
          ]"
          @click="goToSlide(index - 1)"
        />
      </div>
    </div>
  </section>
</template>
