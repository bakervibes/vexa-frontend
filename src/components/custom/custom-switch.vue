<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { computed } from 'vue'

interface Props {
  id?: string
  label?: string
  description?: string
  modelValue?: boolean | string
  disabled?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})

const emits = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const inputId = computed(
  () => props.id || props.name || `switch-${Math.random()}`,
)

const normalizedValue = computed((): boolean => {
  if (typeof props.modelValue === 'boolean') {
    return props.modelValue
  }
  return props.modelValue === 'on' || props.modelValue === 'true'
})

function handleChange(value: boolean) {
  emits('update:modelValue', value)
}
</script>

<template>
  <Label
    :for="inputId"
    class="flex cursor-pointer items-center justify-between border border-[#1E1E1E] bg-[#0A0A0A] p-4"
    :class="{ 'cursor-not-allowed opacity-50': disabled }"
  >
    <div
      v-if="label || description"
      class="space-y-1"
    >
      <div
        v-if="label"
        class="flex items-center gap-2 text-sm leading-none font-normal text-[#E8E8E8] select-none"
      >
        {{ label }}
      </div>
      <p
        v-if="description"
        class="text-xs text-[#555]"
      >
        {{ description }}
      </p>
    </div>

    <Switch
      :id="inputId"
      :name="name"
      :model-value="normalizedValue"
      :disabled="disabled"
      @update:model-value="handleChange"
      class="data-[state=checked]:bg-[#C8A97E] data-[state=unchecked]:bg-[#1E1E1E]"
    />
  </Label>
</template>
