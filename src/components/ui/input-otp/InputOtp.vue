<script setup lang="ts">
import { cn } from '@/utils/lib'
import { OTPInput, type OTPInputProps } from 'vue-input-otp'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<OTPInputProps & { class?: string; containerClass?: string }>(),
  {
    textAlign: 'center',
    inputmode: 'numeric',
  },
)

const delegatedProps = computed(() => {
  const { class: _, containerClass: __, ...rest } = props
  return rest
})
</script>

<template>
  <OTPInput
    v-bind="delegatedProps"
    :container-class="
      cn('flex items-center gap-2 has-[:disabled]:opacity-50', containerClass)
    "
    :class="cn('disabled:cursor-not-allowed', props.class)"
  >
    <slot />
  </OTPInput>
</template>
