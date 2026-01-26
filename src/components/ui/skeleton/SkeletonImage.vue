<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils'
import { ImageIcon } from 'lucide-vue-next'

interface Props {
  width?: string
  height?: string
  aspectRatio?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  showIcon?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  height: 'auto',
  aspectRatio: '16/9',
  rounded: 'md',
  showIcon: true,
})

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}
</script>

<template>
  <div
    :class="
      cn(
        'skeleton-shimmer bg-muted flex items-center justify-center',
        roundedClasses[props.rounded],
        props.class,
      )
    "
    :style="{
      width: props.width,
      height: props.height,
      aspectRatio: props.aspectRatio,
    }"
    role="status"
    aria-label="Loading image..."
  >
    <ImageIcon
      v-if="props.showIcon"
      class="text-muted-foreground/50 size-8"
    />
  </div>
</template>

<style scoped>
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    var(--muted-foreground, oklch(0.556 0 0)) 37%,
    var(--muted) 63%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.dark .skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--muted) 25%,
    oklch(0.4 0 0) 37%,
    var(--muted) 63%
  );
  background-size: 200% 100%;
}
</style>
