<script setup lang="ts">
import { cn } from '@/utils'
import { reactiveOmit } from '@vueuse/core'
import type { TabsTriggerProps } from 'reka-ui'
import { TabsTrigger, useForwardProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const props = defineProps<
  TabsTriggerProps & { class?: HTMLAttributes['class'] }
>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TabsTrigger
    v-bind="forwardedProps"
    :class="
      cn(
        'data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex cursor-pointer items-center justify-center border-b-gray-200 px-3 py-1.5 text-sm font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-2 data-[state=active]:border-b-black data-[state=active]:outline-none',
        props.class,
      )
    "
  >
    <span class="truncate">
      <slot />
    </span>
  </TabsTrigger>
</template>
