<script setup lang="ts">
import { cn } from '@/utils/lib'
import { reactiveOmit } from '@vueuse/core'
import type { SliderRootEmits, SliderRootProps } from 'reka-ui'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { computed, ref, watch } from 'vue'

const props = defineProps<
  SliderRootProps & {
    class?: HTMLAttributes['class']
    formatValue?: (value: number) => string
  }
>()

const emits = defineEmits<SliderRootEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'formatValue', 'modelValue')

const tempValue = ref<number[]>(
  Array.isArray(props.modelValue)
    ? [...props.modelValue]
    : props.defaultValue
      ? [...props.defaultValue]
      : [props.min ?? 0, props.max ?? 100],
)

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      tempValue.value = [...newVal]
    }
  },
)

const onTempUpdate = (value: number[] | undefined) => {
  if (value) {
    tempValue.value = value
  }
}

const onValueCommit = (value: number[] | undefined) => {
  if (value) {
    emits('update:modelValue', value)
    emits('valueCommit', value)
  }
}

const formatDisplayValue = (value: number) => {
  return props.formatValue ? props.formatValue(value) : value.toString()
}

const minValue = computed(() => {
  return tempValue.value[0]
})

const maxValue = computed(() => {
  return tempValue.value[tempValue.value.length - 1]
})
</script>

<template>
  <div class="w-full space-y-3">
    <div class="flex items-center justify-between text-sm">
      <span
        v-if="minValue"
        class="font-medium text-[#555]"
      >
        {{ formatDisplayValue(minValue) }}
      </span>
      <span
        v-if="maxValue"
        class="font-medium text-[#C8A97E]"
      >
        {{ formatDisplayValue(maxValue) }}
      </span>
    </div>

    <SliderRoot
      v-slot="{ modelValue }"
      data-slot="slider"
      :class="
        cn(
          'relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
          props.class,
        )
      "
      v-bind="delegatedProps"
      :model-value="tempValue"
      @update:model-value="onTempUpdate"
      @value-commit="onValueCommit"
    >
      <SliderTrack
        data-slot="slider-track"
        class="relative grow cursor-pointer overflow-hidden bg-[#1E1E1E] data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
      >
        <SliderRange
          data-slot="slider-range"
          class="absolute bg-[#C8A97E] data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderTrack>

      <SliderThumb
        v-for="(_, key) in modelValue"
        :key="key"
        data-slot="slider-thumb"
        class="block size-4 shrink-0 cursor-grab border border-[#C8A97E] bg-[#0A0A0A] shadow-sm transition-[color,box-shadow] hover:ring-2 hover:ring-[#C8A97E]/40 focus-visible:ring-2 focus-visible:ring-[#C8A97E]/40 focus-visible:outline-hidden active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderRoot>
  </div>
</template>
