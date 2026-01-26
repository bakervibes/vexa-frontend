<script setup lang="ts">
import type { MenubarRootEmits, MenubarRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { MenubarRoot, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/utils'

const props = defineProps<
  MenubarRootProps & { class?: HTMLAttributes['class'] }
>()
const emits = defineEmits<MenubarRootEmits>()

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <MenubarRoot
    v-bind="forwarded"
    :class="
      cn(
        'bg-background flex h-10 items-center gap-x-1 rounded-md border p-1',
        props.class,
      )
    "
  >
    <slot />
  </MenubarRoot>
</template>
