<script setup lang="ts">
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    items: any[]
    position?: 'start' | 'center' | 'end'
    className?: string
  }>(),
  {
    position: 'start',
    className: '',
  },
)

defineOptions({
  inheritAttrs: false,
})

// ✅ Typage correct de la ref
const scrollContainer = ref<HTMLElement | null>(null)

const positionClass = computed(() => {
  const positions = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }
  return positions[props.position] || positions.start
})

const scrollLeft = () => {
  scrollContainer.value?.scrollBy({ left: -500, behavior: 'smooth' })
}

const scrollRight = () => {
  scrollContainer.value?.scrollBy({ left: 500, behavior: 'smooth' })
}
</script>

<template>
  <div
    :class="['flex w-full flex-col gap-6', className]"
    v-bind="$attrs"
  >
    <div
      ref="scrollContainer"
      class="no-scrollbar items flex w-full gap-4 overflow-x-auto scroll-smooth py-4 sm:gap-8"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        :class="[
          'shrink-0',
          index === 0 && 'pl-4 sm:pl-8',
          index === items.length - 1 && 'pr-4 sm:pr-8',
        ]"
      >
        <component :is="item" />
      </div>
    </div>

    <!-- Boutons de navigation - cachés sur mobile et tablette -->
    <div
      :class="[
        'flex w-full max-w-7xl gap-2 px-4 sm:px-8 lg:gap-4',
        positionClass,
      ]"
    >
      <button
        type="button"
        @click="scrollLeft"
        class="cursor-pointer p-2 text-black/30 transition-colors hover:text-black/40 sm:p-3"
        aria-label="Défiler vers la gauche"
      >
        <ArrowLeftIcon class="size-5 md:size-6" />
      </button>
      <button
        type="button"
        @click="scrollRight"
        class="cursor-pointer p-4 text-black/30 transition-colors hover:text-black/40 sm:p-3"
        aria-label="Défiler vers la droite"
      >
        <ArrowRightIcon class="size-5 md:size-6" />
      </button>
    </div>
  </div>
</template>

<style scoped></style>
