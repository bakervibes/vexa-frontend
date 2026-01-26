<script setup lang="ts">
import { cn } from '@/utils'
import type {
  CarouselEmits,
  CarouselProps,
  CarouselState,
  WithClassAsProps,
} from './interface'
import { useProvideCarousel } from './useCarousel'

const props = withDefaults(defineProps<CarouselProps & WithClassAsProps>(), {
  orientation: 'horizontal',
})

const emits = defineEmits<CarouselEmits>()

const carouselState: CarouselState = useProvideCarousel(props, emits)

const {
  canScrollNext,
  canScrollPrev,
  carouselApi,
  carouselRef,
  orientation,
  scrollNext,
  scrollPrev,
} = carouselState

defineExpose({
  canScrollNext,
  canScrollPrev,
  carouselApi,
  carouselRef,
  orientation,
  scrollNext,
  scrollPrev,
})

function onKeyDown(event: KeyboardEvent) {
  const prevKey = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  const nextKey = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'

  if (event.key === prevKey) {
    event.preventDefault()
    scrollPrev()

    return
  }

  if (event.key === nextKey) {
    event.preventDefault()
    scrollNext()
  }
}
</script>

<template>
  <div
    :class="
      cn(
        'flex h-full w-full items-center gap-4',
        props.orientation === 'vertical' ? 'flex-col' : 'flex-row',
        props.class,
      )
    "
    role="region"
    aria-roledescription="carousel"
    tabindex="0"
    @keydown="onKeyDown"
  >
    <slot
      :can-scroll-next
      :can-scroll-prev
      :carousel-api
      :carousel-ref
      :orientation
      :scroll-next
      :scroll-prev
    />
  </div>
</template>
