<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id?: string
  label?: string
  description?: string
  modelValue?: boolean
  disabled?: boolean
  // Props venant de vee-validate via v-bind="componentField"
  name?: string
  onBlur?: (e: FocusEvent) => void
  onChange?: (value: boolean) => void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
  blur: [e: FocusEvent]
  change: [value: boolean]
}>()

// Utilise soit l'id fourni, soit le name de vee-validate
const inputId = computed(
  () => props.id || props.name || `switch-${Math.random()}`,
)

// Gestion des événements
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const newValue = target.checked
  emits('update:modelValue', newValue)
  props.onChange?.(newValue)
}

const handleChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const newValue = target.checked
  emits('change', newValue)
}

const handleBlur = (e: FocusEvent) => {
  emits('blur', e)
  props.onBlur?.(e)
}
</script>

<template>
  <div
    class="flex items-center justify-between rounded-lg border p-4"
    :class="{ 'cursor-not-allowed opacity-50': disabled }"
  >
    <div
      v-if="label || description"
      class="space-y-0.5"
    >
      <label
        v-if="label"
        :for="inputId"
        class="cursor-pointer text-sm font-medium"
        :class="{ 'cursor-not-allowed': disabled }"
      >
        {{ label }}
      </label>
      <p
        v-if="description"
        class="text-xs text-gray-500"
      >
        {{ description }}
      </p>
    </div>

    <!-- Switch Toggle -->
    <label
      :for="inputId"
      class="relative inline-flex cursor-pointer items-center"
      :class="{ 'cursor-not-allowed': disabled }"
    >
      <input
        :id="inputId"
        :name="name"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
        class="peer sr-only"
      />
      <div
        class="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full"
      ></div>
    </label>
  </div>
</template>
