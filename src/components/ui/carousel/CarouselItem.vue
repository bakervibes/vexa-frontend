<script setup lang="ts">
import { cn } from '@/utils'
import type { WithClassAsProps } from './interface'
import { useCarousel } from './useCarousel'

const props = withDefaults(
  defineProps<WithClassAsProps & { withGap?: boolean }>(),
  {
    withGap: true,
  },
)

const { orientation } = useCarousel()
</script>

<template>
  <div
    role="group"
    aria-roledescription="slide"
    :class="
      cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        props.withGap && (orientation === 'horizontal' ? 'pl-4' : 'pt-4'),
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
