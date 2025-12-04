<script setup lang="ts">
import Select from 'primevue/select'

interface Props {
  label: string
  modelValue?: string | number | null
  options: { label: string; value: string | number }[]
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Select an option',
  searchPlaceholder: 'Search...',
  disabled: false,
  options: () => [],
})

const emits = defineEmits<{
  'update:modelValue': [value: string | number | null]
  change: [value: string | number | null]
}>()

const handleChange = (event: any) => {
  emits('update:modelValue', event.value)
  emits('change', event.value)
}
</script>

<template>
  <div class="relative w-full border-b border-gray-300">
    <Select
      :modelValue="modelValue"
      @update:modelValue="handleChange"
      :options="options"
      optionLabel="label"
      optionValue="value"
      :placeholder="placeholder"
      :disabled="disabled"
      filter
      :filterPlaceholder="searchPlaceholder"
      class="w-full !rounded-none !border-none pt-8 pb-1 hover:bg-transparent focus:ring-0"
      panelClass="w-full"
    >
      <template #value="slotProps">
        <span
          v-if="slotProps.value"
          class="truncate text-base"
        >
          {{ options.find((opt) => opt.value === slotProps.value)?.label }}
        </span>
        <span
          v-else
          class="text-transparent"
        >
          {{ placeholder }}
        </span>
      </template>
    </Select>

    <label
      class="pointer-events-none absolute top-0 left-0 text-sm text-gray-500 transition-all duration-200 ease-in-out"
    >
      {{ label }}
    </label>
  </div>
</template>
