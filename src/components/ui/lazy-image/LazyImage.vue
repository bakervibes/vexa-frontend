<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '@/utils/lib'

interface Props {
  /** Source de l'image */
  src: string
  /** Texte alternatif */
  alt: string
  /** Classes CSS additionnelles */
  class?: string
  /** URL du placeholder (optionnel) */
  placeholder?: string
  /** Afficher le skeleton pendant le chargement */
  showSkeleton?: boolean
  /** Aspect ratio (ex: "16/9", "4/3", "1/1") */
  aspectRatio?: string
  /** Object-fit CSS */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

const props = withDefaults(defineProps<Props>(), {
  showSkeleton: true,
  objectFit: 'cover',
})

const isLoaded = ref(false)
const hasError = ref(false)

const containerClasses = computed(() =>
  cn('relative overflow-hidden bg-gray-100 dark:bg-gray-800', props.class),
)

const imageClasses = computed(() =>
  cn(
    'w-full h-full transition-opacity duration-300',
    `object-${props.objectFit}`,
    isLoaded.value ? 'opacity-100' : 'opacity-0',
  ),
)

const containerStyle = computed(() => {
  if (props.aspectRatio) {
    return { aspectRatio: props.aspectRatio }
  }
  return {}
})

function onLoad() {
  isLoaded.value = true
}

function onError() {
  hasError.value = true
  isLoaded.value = true
}
</script>

<template>
  <div
    :class="containerClasses"
    :style="containerStyle"
  >
    <!-- Skeleton loader -->
    <div
      v-if="showSkeleton && !isLoaded"
      class="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700"
    />

    <!-- Placeholder image (blur-up technique) -->
    <img
      v-if="placeholder && !isLoaded"
      :src="placeholder"
      :alt="alt"
      class="absolute inset-0 h-full w-full object-cover blur-sm"
    />

    <!-- Main image with native lazy loading -->
    <img
      v-if="!hasError"
      :src="src"
      :alt="alt"
      :class="imageClasses"
      loading="lazy"
      decoding="async"
      @load="onLoad"
      @error="onError"
    />

    <!-- Error state -->
    <div
      v-if="hasError"
      class="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700"
    >
      <span class="text-sm text-gray-500 dark:text-gray-400">
        Image non disponible
      </span>
    </div>
  </div>
</template>
