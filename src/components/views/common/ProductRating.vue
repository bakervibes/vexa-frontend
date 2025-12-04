<script setup lang="ts">
import { StarIcon } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  rating: number
}

const props = defineProps<Props>()

// Renvoie un tableau de 5 valeurs entre 0 et 100 (% de remplissage par étoile)
const stars = computed(() => {
  const values: number[] = []
  let remaining = props.rating

  for (let i = 0; i < 5; i++) {
    if (remaining >= 1) {
      values.push(100) // étoile pleine
    } else if (remaining > 0) {
      values.push(remaining * 100) // pourcentage de remplissage
    } else {
      values.push(0) // vide
    }
    remaining -= 1
  }

  return values
})
</script>

<template>
  <div class="flex items-center">
    <template
      v-for="(fillPercent, index) in stars"
      :key="index"
    >
      <div class="relative h-4 w-4">
        <!-- Contour gris -->
        <StarIcon
          class="absolute top-0 left-0 h-full w-full text-gray-300"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        />

        <!-- Remplissage dynamique -->
        <StarIcon
          class="absolute top-0 left-0 h-full w-full text-yellow-400"
          fill="currentColor"
          stroke="none"
          :style="{
            clipPath: `inset(0 ${100 - fillPercent}% 0 0)`,
          }"
        />
      </div>
    </template>

    <span
      v-if="props.rating > 0"
      class="ml-1 text-sm text-gray-600"
    >
      {{ props.rating.toFixed(1) }}
    </span>
  </div>
</template>

<style scoped></style>
