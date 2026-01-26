<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils'
import SkeletonImage from './SkeletonImage.vue'
import SkeletonText from './SkeletonText.vue'

interface Props {
  variant?: 'product' | 'article' | 'simple'
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'product',
})
</script>

<template>
  <div
    :class="cn('bg-card overflow-hidden rounded-lg border', props.class)"
    role="status"
    aria-label="Loading card..."
  >
    <!-- Product Card Skeleton -->
    <template v-if="props.variant === 'product'">
      <SkeletonImage
        aspect-ratio="1/1"
        rounded="none"
        :show-icon="true"
      />
      <div class="space-y-3 p-4">
        <div class="skeleton-shimmer h-4 w-3/4 rounded" />
        <div class="skeleton-shimmer h-3 w-1/2 rounded" />
        <div class="flex items-center justify-between pt-2">
          <div class="skeleton-shimmer h-5 w-20 rounded" />
          <div class="skeleton-shimmer h-8 w-8 rounded-full" />
        </div>
      </div>
    </template>

    <!-- Article Card Skeleton -->
    <template v-else-if="props.variant === 'article'">
      <SkeletonImage
        aspect-ratio="16/9"
        rounded="none"
        :show-icon="true"
      />
      <div class="space-y-3 p-4">
        <div class="skeleton-shimmer h-5 w-full rounded" />
        <SkeletonText
          :lines="2"
          last-line-width="80%"
        />
        <div class="flex items-center gap-2 pt-2">
          <div class="skeleton-shimmer h-8 w-8 rounded-full" />
          <div class="skeleton-shimmer h-3 w-24 rounded" />
        </div>
      </div>
    </template>

    <!-- Simple Card Skeleton -->
    <template v-else>
      <div class="space-y-3 p-4">
        <div class="skeleton-shimmer h-5 w-3/4 rounded" />
        <SkeletonText
          :lines="3"
          last-line-width="60%"
        />
      </div>
    </template>
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
