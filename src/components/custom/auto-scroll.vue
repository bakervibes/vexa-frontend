<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    items: any[]
    speed?: number
  }>(),
  {
    speed: 1,
  },
)

const scrollContainer = ref<HTMLElement | null>(null)
const isPaused = ref(false)
let animationId: number | null = null
let position = 0

const animate = () => {
  if (!scrollContainer.value || isPaused.value) {
    animationId = requestAnimationFrame(animate)
    return
  }

  position += props.speed
  scrollContainer.value.scrollLeft = position

  if (
    scrollContainer.value.scrollLeft >=
    scrollContainer.value.scrollWidth / 2
  ) {
    position = 0
    scrollContainer.value.scrollLeft = 0
  }

  animationId = requestAnimationFrame(animate)
}

const handleMouseEnter = () => {
  isPaused.value = true
}

const handleMouseLeave = () => {
  isPaused.value = false
}

onMounted(() => {
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<template>
  <div
    ref="scrollContainer"
    class="no-scrollbar flex gap-24 overflow-x-hidden py-4"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="shrink-0"
    >
      <component :is="item" />
    </div>
  </div>
</template>
