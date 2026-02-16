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
  const stringValue = String(value)
  const original =
    props.options.find((o) => String(o.value) === stringValue)?.value ??
    stringValue
  emits('update:modelValue', original)
}
</script>

<template>
  <div class="flex w-full flex-col gap-2 border-b border-[#1E1E1E] pb-3">
    <Label
      :for="inputId"
      class="text-xs tracking-widest text-[#555] uppercase"
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
        class="w-full rounded-none border-none bg-transparent px-0 pb-0 text-[#E8E8E8] shadow-none focus:border-[#C8A97E]/40 focus:ring-0 focus:ring-offset-0"
      >
        <SelectValue
          :placeholder="placeholder"
          class="text-[#555]"
        />
      </SelectTrigger>

      <SelectContent class="border-[#1E1E1E] bg-[#0A0A0A] text-[#E8E8E8]">
        <SelectItem
          v-for="option in options"
          :key="option.value"
          :value="String(option.value)"
          class="hover:bg-surface focus:bg-surface cursor-pointer focus:text-[#C8A97E]"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
