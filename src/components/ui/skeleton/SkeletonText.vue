<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils'

interface Props {
  lines?: number
  lastLineWidth?: string
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  lines: 3,
  lastLineWidth: '60%',
})
</script>

<template>
  <div
    :class="cn('space-y-2', props.class)"
    role="status"
    aria-label="Loading..."
  >
    <div
      v-for="i in props.lines"
      :key="i"
      class="skeleton-shimmer h-4 rounded"
      :style="{ width: i === props.lines ? props.lastLineWidth : '100%' }"
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
