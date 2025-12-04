<script setup lang="ts">
import { Loader2Icon } from 'lucide-vue-next'
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '../ui/button'
import { Button } from '../ui/button'

interface ButtonProps extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}

interface ExtraProps {
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps & ExtraProps>(), {
  loading: false,
  as: 'button',
})
</script>

<template>
  <Button
    v-bind="props"
    :disabled="props.disabled || props.loading"
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
