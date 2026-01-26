<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h1 class="text-2xl font-bold tracking-tight">{{ title }}</h1>
      <p
        v-if="description"
        class="text-muted-foreground text-sm"
      >
        {{ description }}
      </p>
    </div>
    <div class="mt-4 flex items-center gap-2 sm:mt-0">
      <slot name="actions" />
    </div>
  </div>
</template>
