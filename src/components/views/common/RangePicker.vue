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

// Valeurs temporaires pendant le drag
const tempValue = ref<number[]>(
  Array.isArray(props.modelValue)
    ? [...props.modelValue]
    : props.defaultValue
      ? [...props.defaultValue]
      : [props.min ?? 0, props.max ?? 100],
)

// Synchronise tempValue quand modelValue change de l'extérieur
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      tempValue.value = [...newVal]
    }
  },
)

// Mise à jour des valeurs temporaires pendant le drag
const onTempUpdate = (value: number[] | undefined) => {
  if (value) {
    tempValue.value = value
  }
}

// Émet la valeur finale au relâchement (valueCommit)
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
    <div
      class="text-muted-foreground flex items-center justify-between text-sm"
    >
      <span
        v-if="minValue"
        class="font-medium"
      >
        {{ formatDisplayValue(minValue) }}
      </span>
      <span
        v-if="maxValue"
        class="font-medium"
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
        class="bg-muted relative grow cursor-pointer overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
      >
        <SliderRange
          data-slot="slider-range"
          class="bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
        />
      </SliderTrack>

      <SliderThumb
        v-for="(_, key) in modelValue"
        :key="key"
        data-slot="slider-thumb"
        class="border-primary ring-ring/50 block size-4 shrink-0 cursor-grab rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden active:cursor-grabbing disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderRoot>
  </div>
</template>
