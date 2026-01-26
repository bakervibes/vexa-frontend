<script setup lang="ts">
import { cn } from '@/utils/lib'

const props = defineProps<{ class?: string }>()
</script>

<template>
  <div :class="cn('flex items-center', props.class)">
    <slot />
  </div>
</template>
