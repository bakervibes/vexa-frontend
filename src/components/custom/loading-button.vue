<script setup lang="ts">
import { Loader2Icon } from 'lucide-vue-next'
import Button from 'primevue/button'
import type { HTMLAttributes } from 'vue'

interface ButtonProps {
  severity?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'danger'
    | 'contrast'
  size?: 'small' | 'large'
  text?: boolean
  outlined?: boolean
  class?: HTMLAttributes['class']
}

interface ExtraProps {
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<ButtonProps & ExtraProps>(), {
  loading: false,
})
</script>

<template>
  <Button
    :disabled="props.disabled || props.loading"
    :severity="props.severity"
    :size="props.size"
    :text="props.text"
    :outlined="props.outlined"
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
