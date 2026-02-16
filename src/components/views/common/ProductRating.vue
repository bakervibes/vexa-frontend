<script setup lang="ts">
import { StarIcon } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  rating: number | null | undefined
  showNumber?: boolean
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  showNumber: true,
  size: 'md',
})

const normalizedRating = computed(() => props.rating ?? 0)

const stars = computed(() => {
  const values: number[] = []
  let remaining = normalizedRating.value

  for (let i = 0; i < 5; i++) {
    if (remaining >= 1) {
      values.push(100)
    } else if (remaining > 0) {
      values.push(remaining * 100)
    } else {
      values.push(0)
    }
    remaining -= 1
  }

  return values
})
</script>

<template>
  <div
    v-if="normalizedRating > 0"
    class="flex items-center"
  >
    <template
      v-for="(fillPercent, index) in stars"
      :key="index"
    >
      <div
        class="relative"
        :class="size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'"
      >
        <StarIcon
          class="text-gold/30 absolute top-0 left-0 h-full w-full"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        />

        <StarIcon
          class="text-gold absolute top-0 left-0 h-full w-full"
          fill="currentColor"
          stroke="none"
          :style="{
            clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
          }"
        />
      </div>
    </template>

    <span
      v-if="showNumber"
      :class="['ml-1.5 text-[#555]', size === 'sm' ? 'text-xs' : 'text-sm']"
    >
      ({{ normalizedRating.toFixed(1) }})
    </span>
  </div>
</template>
