<script setup lang="ts">
import type { ButtonVariants } from '@/components/ui/button'
import { Button } from '@/components/ui/button'
import { Loader2Icon } from 'lucide-vue-next'
import type { HTMLAttributes } from 'vue'

interface Props {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  variant: 'default',
  size: 'default',
})
</script>

<template>
  <Button
    :disabled="props.disabled || props.loading"
    :variant="props.variant"
    :size="props.size"
    :class="props.class"
    class="relative"
  >
    <!-- Le slot reste, mais devient invisible en loading -->
    <div
      class="flex items-center gap-1"
      :class="props.loading ? 'opacity-0' : 'opacity-100'"
    >
      <slot />
    </div>

    <!-- Loader par-dessus, centré -->
    <div
      v-if="props.loading"
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <Loader2Icon class="size-4 animate-spin" />
    </div>
  </Button>
</template>
