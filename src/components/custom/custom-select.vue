<script setup lang="ts">
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AcceptableValue } from 'reka-ui'
import { computed } from 'vue'

interface Option {
  label: string
  value: string | number
}

interface Props {
  id?: string
  label: string
  modelValue?: string | number | null
  options: Option[]
  placeholder?: string
  disabled?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Select an option',
  disabled: false,
  options: () => [],
})

const emits = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const inputId = computed(
  () => props.id || props.name || `select-${Math.random()}`,
)

const internalValue = computed(() =>
  props.modelValue !== null && props.modelValue !== undefined
    ? String(props.modelValue)
    : '',
)

function handleChange(value: AcceptableValue) {
  if (value === null || value === undefined) return
  // On retrouve le type d'origine (string/number)
  const stringValue = String(value)
  const original =
    props.options.find((o) => String(o.value) === stringValue)?.value ??
    stringValue
  emits('update:modelValue', original)
}
</script>

<template>
  <div class="flex w-full flex-col gap-1 border-b border-gray-300">
    <Label
      :for="inputId"
      class="font-normal text-gray-600"
    >
      {{ label }}
    </Label>

    <Select
      :model-value="internalValue"
      :disabled="disabled"
      :name="name"
      @update:model-value="handleChange"
    >
      <SelectTrigger
        :id="inputId"
        class="w-full rounded-none border-none bg-transparent px-0 pb-1 shadow-none focus:ring-0 focus:ring-offset-0"
      >
        <SelectValue :placeholder="placeholder" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="String(option.value)"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
