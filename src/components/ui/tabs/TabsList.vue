<script setup lang="ts">
import { cn } from '@/utils'
import { reactiveOmit } from '@vueuse/core'
import type { TabsListProps } from 'reka-ui'
import { TabsList } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <TabsList
    v-bind="delegatedProps"
    :class="
      cn(
        'bg-muted text-muted-foreground inline-flex items-center justify-center rounded-md',
        props.class,
      )
    "
  >
    <slot />
  </TabsList>
</template>
