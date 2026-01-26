<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { cn } from '@/utils'
import { ArrowLeft } from 'lucide-vue-next'
import type { WithClassAsProps } from './interface'
import { useCarousel } from './useCarousel'

const props = defineProps<WithClassAsProps>()

const { orientation, canScrollPrev, scrollPrev } = useCarousel()
</script>

<template>
  <Button
    :disabled="!canScrollPrev"
    :class="
      cn(
        'h-8 w-8 touch-manipulation rounded-full p-0',
        orientation === 'horizontal'
          ? '-translate-y-1/2'
          : '-translate-x-1/2 rotate-90',
        props.class,
      )
    "
    variant="outline"
    @click="scrollPrev"
  >
    <slot>
      <ArrowLeft class="h-4 w-4 text-current" />
      <span class="sr-only">Previous Slide</span>
    </slot>
  </Button>
</template>
