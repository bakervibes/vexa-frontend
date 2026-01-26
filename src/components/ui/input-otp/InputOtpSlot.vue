<script setup lang="ts">
import { cn } from '@/utils/lib'
import { useVueOTPContext } from 'vue-input-otp'
import { computed } from 'vue'

const props = defineProps<{ index: number; class?: string }>()

const context = useVueOTPContext()

const char = computed(() => context?.value?.slots[props.index]?.char)
const hasFakeCaret = computed(
  () => context?.value?.slots[props.index]?.hasFakeCaret,
)
const isActive = computed(() => context?.value?.slots[props.index]?.isActive)
</script>

<template>
  <div
    :class="
      cn(
        'border-input relative flex h-12 w-12 items-center justify-center border-y border-r text-base font-medium transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'ring-ring ring-offset-background z-10 ring-2',
        props.class,
      )
    "
  >
    <div v-if="char">
      {{ char }}
    </div>
    <div
      v-if="hasFakeCaret"
      class="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div class="animate-caret-blink bg-foreground h-5 w-px duration-1000" />
    </div>
  </div>
</template>

<style scoped>
@keyframes caret-blink {
  0%,
  70%,
  100% {
    opacity: 1;
  }
  20%,
  50% {
    opacity: 0;
  }
}

.animate-caret-blink {
  animation: caret-blink 1.2s ease-out infinite;
}
</style>
