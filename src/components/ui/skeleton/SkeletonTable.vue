<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/utils'

interface Props {
  rows?: number
  columns?: number
  showHeader?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 4,
  showHeader: true,
})
</script>

<template>
  <div
    :class="cn('w-full overflow-hidden rounded-lg border', props.class)"
    role="status"
    aria-label="Loading table..."
  >
    <table class="w-full">
      <!-- Header -->
      <thead v-if="props.showHeader">
        <tr class="bg-muted/50 border-b">
          <th
            v-for="col in props.columns"
            :key="`header-${col}`"
            class="p-4 text-left"
          >
            <div
              class="skeleton-shimmer h-4 rounded"
              :style="{ width: `${60 + Math.random() * 30}%` }"
            />
          </th>
        </tr>
      </thead>

      <!-- Body -->
      <tbody>
        <tr
          v-for="row in props.rows"
          :key="`row-${row}`"
          class="border-b last:border-0"
        >
          <td
            v-for="col in props.columns"
            :key="`cell-${row}-${col}`"
            class="p-4"
          >
            <div
              class="skeleton-shimmer h-4 rounded"
              :style="{ width: `${50 + Math.random() * 40}%` }"
            />
          </td>
        </tr>
      </tbody>
    </table>
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
