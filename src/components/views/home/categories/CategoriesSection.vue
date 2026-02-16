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
  categories,
  isLoadingCategories,
  isErrorCategories,
  refetchCategories,
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
  const bottomItems = categories.value.filter((cat) => cat.position.y === 0)

  const topItems = categories.value.filter((cat) => cat.position.y === 1)

  const chunks = []

  const maxChunks = Math.ceil(categories.value.length / 4)

  for (let i = 0; i < maxChunks; i++) {
    const chunk = []

    if (topItems.length > i * 2) {
      chunk[0] = topItems[i * 2]
    } else if (bottomItems.length > i * 2 + 2) {
      chunk[0] = bottomItems[i * 2 + 2]
    }

    if (bottomItems.length > i * 2) {
      chunk[1] = bottomItems[i * 2]
    } else if (topItems.length > i * 2 + 2) {
      chunk[1] = topItems[i * 2 + 2]
    }

    if (bottomItems.length > i * 2 + 1) {
      chunk[2] = bottomItems[i * 2 + 1]
    } else if (topItems.length > i * 2 + 3) {
      chunk[2] = topItems[i * 2 + 3]
    }

    if (topItems.length > i * 2 + 1) {
      chunk[3] = topItems[i * 2 + 1]
    } else if (bottomItems.length > i * 2 + 3) {
      chunk[3] = bottomItems[i * 2 + 3]
    }

    const filteredChunk = chunk.filter(Boolean)
    if (filteredChunk.length > 0) {
      chunks.push(filteredChunk)
    }
  }

  return chunks
})

function getPositionClasses(position?: { x?: number; y?: number }) {
  const x = position?.x ?? 0
  const y = position?.y ?? 0
  const horizontal = x === 0 ? 'left-4' : 'right-4'
  const vertical = y === 0 ? 'bottom-4' : 'top-4'
  return `${horizontal} ${vertical}`
}

function handleRefetch() {
  refetchCategories()
}

const goToSlide = (index: number) => {
  emblaApi.value?.scrollTo(index)
}

const getUrl = (categorySlug: string) => {
  return `/shop?categories=${categorySlug}`
}
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-6 py-32">
    <div class="text-gold mb-6 text-center text-xs tracking-[0.3em] uppercase">
      Catégories
    </div>

    <h2
      class="font-display text-text mb-4 text-center text-5xl font-light md:text-6xl"
    >
      Nos
      <span class="italic">sélections</span>
    </h2>

    <div class="bg-gold/40 mx-auto my-12 h-px w-24" />

    <div
      v-if="isLoadingCategories"
      class="flex h-64 items-center justify-center"
    >
      <div
        class="border-t-gold border-border-noir h-8 w-8 animate-spin border-2"
      />
    </div>

    <div
      v-else-if="isErrorCategories"
      class="flex h-64 flex-col items-center justify-center gap-4"
    >
      <p class="text-[#555]">Erreur lors du chargement</p>
      <button
        @click="handleRefetch"
        class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-widest uppercase transition-all"
      >
        Réessayer
      </button>
    </div>

    <div
      v-else-if="!categories || categories.length === 0"
      class="flex h-64 items-center justify-center"
    >
      <p class="text-[#555]">Aucune catégorie disponible</p>
    </div>

    <template v-else>
      <div
        v-if="chunkedCategories.length > 1"
        class="mb-8 flex justify-center"
      >
        <div class="flex gap-3">
          <div
            v-for="index in chunkedCategories.length"
            :key="index"
            :class="[
              'bg-gold/30 hover:bg-gold h-px cursor-pointer transition-all duration-300',
              currentIndex === index - 1 ? 'bg-gold w-10' : 'w-4',
            ]"
            @click="goToSlide(index - 1)"
          />
        </div>
      </div>

      <Carousel
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
            <div
              class="grid grid-cols-1 gap-4"
              :class="{
                'md:grid-cols-2': chunk.length === 2 || chunk.length === 3,
                'md:grid-cols-3': chunk.length === 4,
              }"
            >
              <RouterLink
                v-if="chunk[0]"
                :to="getUrl(chunk[0].slug)"
                class="group hover:border-gold/30 border-border-noir bg-surface relative h-80 w-full overflow-hidden border transition-colors md:h-100"
              >
                <img
                  v-if="chunk[0].image"
                  :src="chunk[0].image"
                  :alt="chunk[0].name"
                  class="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                />

                <div
                  :class="[
                    'absolute w-max max-w-[calc(100%-2rem)]',
                    getPositionClasses(chunk[0].position),
                  ]"
                >
                  <h3
                    class="font-display text-text text-2xl font-light md:text-3xl"
                  >
                    {{ chunk[0].name }}
                  </h3>
                  <div
                    class="text-gold mt-2 flex items-center gap-2 text-xs tracking-widest uppercase group-hover:underline"
                  >
                    <span>Découvrir</span>
                    <ArrowRightIcon class="size-4" />
                  </div>
                </div>
              </RouterLink>

              <div class="flex flex-col gap-4">
                <RouterLink
                  v-if="chunk[1]"
                  :to="getUrl(chunk[1].slug)"
                  class="group hover:border-gold/30 border-border-noir bg-surface relative h-40 w-full overflow-hidden border transition-colors md:h-48"
                >
                  <img
                    v-if="chunk[1].image"
                    :src="chunk[1].image"
                    :alt="chunk[1].name"
                    class="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                  />

                  <div
                    :class="[
                      'absolute w-max max-w-[calc(100%-2rem)]',
                      getPositionClasses(chunk[1].position),
                    ]"
                  >
                    <h3
                      class="font-display text-text text-xl font-light md:text-2xl"
                    >
                      {{ chunk[1].name }}
                    </h3>
                    <div
                      class="text-gold mt-2 flex items-center gap-2 text-xs tracking-widest uppercase group-hover:underline"
                    >
                      <span>Découvrir</span>
                      <ArrowRightIcon class="size-4" />
                    </div>
                  </div>
                </RouterLink>

                <RouterLink
                  v-if="chunk[2]"
                  :to="getUrl(chunk[2].slug)"
                  class="group hover:border-gold/30 border-border-noir bg-surface relative h-40 w-full overflow-hidden border transition-colors md:h-48"
                >
                  <img
                    v-if="chunk[2].image"
                    :src="chunk[2].image"
                    :alt="chunk[2].name"
                    class="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                  />

                  <div
                    :class="[
                      'absolute w-max max-w-[calc(100%-2rem)]',
                      getPositionClasses(chunk[2].position),
                    ]"
                  >
                    <h3
                      class="font-display text-text text-xl font-light md:text-2xl"
                    >
                      {{ chunk[2].name }}
                    </h3>
                    <div
                      class="text-gold mt-2 flex items-center gap-2 text-xs tracking-widest uppercase group-hover:underline"
                    >
                      <span>Découvrir</span>
                      <ArrowRightIcon class="size-4" />
                    </div>
                  </div>
                </RouterLink>
              </div>

              <RouterLink
                v-if="chunk[3]"
                :to="getUrl(chunk[3].slug)"
                class="group hover:border-gold/30 border-border-noir bg-surface relative h-80 w-full overflow-hidden border transition-colors md:h-100"
              >
                <img
                  v-if="chunk[3].image"
                  :src="chunk[3].image"
                  :alt="chunk[3].name"
                  class="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                />

                <div
                  :class="[
                    'absolute w-max max-w-[calc(100%-2rem)]',
                    getPositionClasses(chunk[3].position),
                  ]"
                >
                  <h3
                    class="font-display text-text text-2xl font-light md:text-3xl"
                  >
                    {{ chunk[3].name }}
                  </h3>
                  <div
                    class="text-gold mt-2 flex items-center gap-2 text-xs tracking-widest uppercase group-hover:underline"
                  >
                    <span>Découvrir</span>
                    <ArrowRightIcon class="size-4" />
                  </div>
                </div>
              </RouterLink>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </template>
  </section>
</template>
