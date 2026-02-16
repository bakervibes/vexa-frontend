<script setup lang="ts">
import { cn } from '@/utils/lib'
import { computed, ref } from 'vue'

interface Props {
  src: string
  alt: string
  class?: string
  placeholder?: string
  showSkeleton?: boolean
  aspectRatio?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

const props = withDefaults(defineProps<Props>(), {
  showSkeleton: true,
  objectFit: 'cover',
})

const isLoaded = ref(false)
const hasError = ref(false)

const containerClasses = computed(() =>
  cn('relative overflow-hidden bg-[#0A0A0A]', props.class),
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
    <div
      v-if="showSkeleton && !isLoaded"
      class="bg-surface absolute inset-0 animate-pulse"
    />

    <img
      v-if="placeholder && !isLoaded"
      :src="placeholder"
      :alt="alt"
      class="absolute inset-0 h-full w-full object-cover blur-sm"
    />

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

    <div
      v-if="hasError"
      class="bg-surface flex h-full w-full items-center justify-center"
    >
      <span class="text-xs tracking-widest text-[#555] uppercase">
        Image non disponible
      </span>
    </div>
  </div>
</template>
