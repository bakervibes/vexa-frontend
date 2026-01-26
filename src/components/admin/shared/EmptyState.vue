<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  description?: string
  icon?: Component
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div
      v-if="icon"
      class="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full"
    >
      <component
        :is="icon"
        class="text-muted-foreground h-6 w-6"
      />
    </div>
    <h3 class="text-lg font-medium">{{ title }}</h3>
    <p
      v-if="description"
      class="text-muted-foreground mt-1 text-sm"
    >
      {{ description }}
    </p>
    <div class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
