<script setup lang="ts">
import { cn } from '@/utils'
import type { HTMLAttributes } from 'vue'
import type { Component } from 'vue'

interface Props {
  title: string
  value: string | number
  description?: string
  icon?: Component
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="
      cn(
        'bg-card text-card-foreground rounded-xl border p-6 shadow-sm',
        props.class,
      )
    "
  >
    <div class="flex items-center justify-between">
      <p class="text-muted-foreground text-sm font-medium">{{ title }}</p>
      <component
        v-if="icon"
        :is="icon"
        class="text-muted-foreground h-5 w-5"
      />
    </div>
    <div class="mt-2 flex items-baseline gap-2">
      <p class="text-3xl font-bold tracking-tight">{{ value }}</p>
      <span
        v-if="trendValue"
        :class="[
          'text-sm font-medium',
          trend === 'up' && 'text-green-600',
          trend === 'down' && 'text-red-600',
          trend === 'neutral' && 'text-muted-foreground',
        ]"
      >
        {{ trend === 'up' ? '+' : trend === 'down' ? '' : '' }}{{ trendValue }}
      </span>
    </div>
    <p
      v-if="description"
      class="text-muted-foreground mt-1 text-xs"
    >
      {{ description }}
    </p>
  </div>
</template>
