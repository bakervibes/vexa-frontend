<script setup lang="ts">
import { cn } from '@/utils'
import { reactiveOmit } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import type { SelectTriggerProps } from 'reka-ui'
import { SelectIcon, SelectTrigger, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const props = defineProps<
  SelectTriggerProps & { class?: HTMLAttributes['class'] }
>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'border-input bg-background ring-offset-background data-placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-start text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon
      as-child
      class="mt-1"
    >
      <ChevronDown class="h-4 w-4 shrink-0 opacity-50" />
    </SelectIcon>
  </SelectTrigger>
</template>
