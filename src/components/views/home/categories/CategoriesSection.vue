<script setup lang="ts">
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel'
import { useCategories } from '@/composables/useCategories'
import { ArrowRightIcon } from 'lucide-vue-next'
import { computed, ref, watchEffect } from 'vue'

const {
  bestSellingCategories,
  isLoadingBestSellingCategories,
  isErrorBestSellingCategories,
  refetchBestSellingCategories,
} = useCategories()

const emblaApi = ref<CarouselApi>()
const currentIndex = ref(0)

watchEffect(() => {
  if (!emblaApi.value) return

  emblaApi.value.on('select', () => {
    currentIndex.value = emblaApi.value?.selectedScrollSnap() ?? 0
  })
})

const chunkedCategories = computed(() => {
  const bottomItems = bestSellingCategories.value.filter(
    (cat) => cat.position.y === 0,
  )

  const topItems = bestSellingCategories.value.filter(
    (cat) => cat.position.y === 1,
  )

  const chunks = []

  const maxChunks = Math.ceil(bestSellingCategories.value.length / 4)

  for (let i = 0; i < maxChunks; i++) {
    const chunk = []

    // Position 0 (left large): take from topItems (y=1)
    if (topItems.length > i * 2) {
      chunk[0] = topItems[i * 2]
    } else if (bottomItems.length > i * 2 + 2) {
      chunk[0] = bottomItems[i * 2 + 2]
    }

    // Position 1 (middle top): take from bottomItems (y=0)
    if (bottomItems.length > i * 2) {
      chunk[1] = bottomItems[i * 2]
    } else if (topItems.length > i * 2 + 2) {
      chunk[1] = topItems[i * 2 + 2]
    }

    // Position 2 (middle bottom): take from bottomItems (y=0)
    if (bottomItems.length > i * 2 + 1) {
      chunk[2] = bottomItems[i * 2 + 1]
    } else if (topItems.length > i * 2 + 3) {
      chunk[2] = topItems[i * 2 + 3]
    }

    // Position 3 (right large): take from topItems (y=1)
    if (topItems.length > i * 2 + 1) {
      chunk[3] = topItems[i * 2 + 1]
    } else if (bottomItems.length > i * 2 + 3) {
      chunk[3] = bottomItems[i * 2 + 3]
    }

    // Only add chunk if it has at least one item
    const filteredChunk = chunk.filter(Boolean)
    if (filteredChunk.length > 0) {
      chunks.push(filteredChunk)
    }
  }

  return chunks
})

// Get position classes based on x and y values
function getPositionClasses(position?: { x?: number; y?: number }) {
  const x = position?.x ?? 0
  const y = position?.y ?? 0
  const horizontal = x === 0 ? 'left-4' : 'right-4'
  const vertical = y === 0 ? 'bottom-4' : 'top-4'
  return `${horizontal} ${vertical}`
}

// Handle refetch with proper typing
function handleRefetch() {
  refetchBestSellingCategories()
}

const goToSlide = (index: number) => {
  emblaApi.value?.scrollTo(index)
}

const getUrl = (categorySlug: string) => {
  return `/shop?categories=${categorySlug}`
}
</script>

<template>
  <section class="mx-auto w-full max-w-7xl px-4 py-12">
    <div class="mb-4 flex items-center justify-end sm:justify-between">
      <h2 class="hidden text-xl font-bold text-black sm:block sm:text-2xl">
        Our categories
      </h2>

      <div
        class="flex"
        v-if="chunkedCategories.length > 1"
      >
        <div
          v-for="index in chunkedCategories.length"
          :key="index"
          class="cursor-pointer p-1"
          @click="goToSlide(index - 1)"
        >
          <div
            :class="[
              'h-2 rounded-full transition-all duration-300',
              currentIndex === index - 1
                ? 'w-8 bg-black'
                : 'w-2 bg-gray-300 hover:bg-gray-400',
            ]"
          />
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="isLoadingBestSellingCategories"
      class="flex h-64 items-center justify-center"
    >
      <div
        class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"
      />
    </div>

    <!-- Error state -->
    <div
      v-else-if="isErrorBestSellingCategories"
      class="flex h-64 flex-col items-center justify-center gap-4"
    >
      <p class="text-gray-600">Error loading categories</p>
      <button
        @click="handleRefetch"
        class="rounded-md bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
      >
        Retry
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!bestSellingCategories || bestSellingCategories.length === 0"
      class="flex h-64 items-center justify-center"
    >
      <p class="text-gray-600">No categories available at the moment</p>
    </div>

    <!-- Success state with data -->
    <Carousel
      v-else
      @init-api="(val) => (emblaApi = val)"
      :opts="{
        loop: true,
      }"
    >
      <CarouselContent>
        <CarouselItem
          v-for="(chunk, chunkIndex) in chunkedCategories"
          :key="chunkIndex"
        >
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <!-- First column (1 large item) -->
            <RouterLink
              v-if="chunk[0]"
              :to="getUrl(chunk[0].slug)"
              class="group relative h-80 w-full cursor-pointer overflow-hidden transition-all md:h-100"
            >
              <img
                :src="chunk[0].image ?? undefined"
                :alt="chunk[0].name"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div
                :class="[
                  'absolute w-max max-w-[calc(100%-2rem)]',
                  getPositionClasses(chunk[0].position),
                ]"
              >
                <h3 class="text-xl font-bold text-black md:text-2xl">
                  {{ chunk[0].name }}
                </h3>
                <div
                  class="flex items-center gap-2 text-sm font-medium text-black group-hover:underline"
                >
                  <span>Shop Now</span>
                  <ArrowRightIcon class="size-4" />
                </div>
              </div>
            </RouterLink>

            <!-- Middle column (2 items stacked) -->
            <div class="flex flex-col gap-4">
              <RouterLink
                v-if="chunk[1]"
                :to="getUrl(chunk[1].slug)"
                class="group relative h-40 w-full cursor-pointer overflow-hidden transition-all md:h-48"
              >
                <div
                  class="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <img
                  :src="chunk[1].image ?? undefined"
                  :alt="chunk[1].name"
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div
                  :class="[
                    'absolute w-max max-w-[calc(100%-2rem)]',
                    getPositionClasses(chunk[1].position),
                  ]"
                >
                  <h3 class="text-xl font-bold text-black md:text-2xl">
                    {{ chunk[1].name }}
                  </h3>
                  <div
                    class="flex items-center gap-2 text-sm font-medium text-black group-hover:underline"
                  >
                    <span>Shop Now</span>
                    <ArrowRightIcon class="size-4" />
                  </div>
                </div>
              </RouterLink>

              <RouterLink
                v-if="chunk[2]"
                :to="getUrl(chunk[2].slug)"
                class="group relative h-40 w-full cursor-pointer overflow-hidden transition-all md:h-48"
              >
                <div
                  class="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <img
                  :src="chunk[2].image ?? undefined"
                  :alt="chunk[2].name"
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div
                  :class="[
                    'absolute w-max max-w-[calc(100%-2rem)]',
                    getPositionClasses(chunk[2].position),
                  ]"
                >
                  <h3 class="text-xl font-bold text-black md:text-2xl">
                    {{ chunk[2].name }}
                  </h3>
                  <div
                    class="flex items-center gap-2 text-sm font-medium text-black group-hover:underline"
                  >
                    <span>Shop Now</span>
                    <ArrowRightIcon class="size-4" />
                  </div>
                </div>
              </RouterLink>
            </div>

            <!-- Third column (1 large item) -->
            <div
              v-if="chunk[3]"
              class="group relative h-80 w-full cursor-pointer overflow-hidden transition-all md:h-100"
            >
              <img
                :src="chunk[3].image ?? undefined"
                :alt="chunk[3].name"
                class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div
                :class="[
                  'absolute w-max max-w-[calc(100%-2rem)]',
                  getPositionClasses(chunk[3].position),
                ]"
              >
                <h3 class="text-xl font-bold text-black md:text-2xl">
                  {{ chunk[3].name }}
                </h3>
                <div
                  class="flex items-center gap-2 text-sm font-medium text-black group-hover:underline"
                >
                  <span>Shop Now</span>
                  <ArrowRightIcon class="size-4" />
                </div>
              </div>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>
    </Carousel>
  </section>
</template>

<style scoped></style>
