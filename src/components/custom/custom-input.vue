<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'

interface Props {
  id?: string
  label?: string
  type?: string
  required?: boolean
  placeholder?: string
  modelValue?: string | number
  disabled?: boolean
  showBorder?: boolean
  // Props venant de vee-validate via v-bind="componentField"
  name?: string
  onChange?: (e: Event) => void
  onInput?: (e: Event) => void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  modelValue: '',
  disabled: false,
  showBorder: true,
})

const emits = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [e: Event]
  input: [e: Event]
}>()

const displayPassword = ref(false)
const inputType = computed(() => {
  if (props.type === 'password') {
    return displayPassword.value ? 'text' : 'password'
  }
  return props.type
})

// Utilise soit l'id fourni, soit le name de vee-validate
const inputId = computed(
  () => props.id || props.name || `input-${Math.random()}`,
)

// Gestion des événements
const handleInput = (value: string | number) => {
  emits('update:modelValue', value)
}
</script>

<template>
  <div
    class="flex w-full flex-col gap-1"
    :class="{ 'border-b border-gray-300': showBorder }"
  >
    <Label
      v-if="label"
      :for="inputId"
      class="font-normal text-gray-600"
    >
      {{ label }}
    </Label>

    <div class="relative flex w-full items-center px-0.5">
      <Input
        :id="inputId"
        :name="name"
        :type="inputType"
        :model-value="modelValue"
        @update:model-value="handleInput"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        class="w-full rounded-none border-none bg-transparent px-0 pb-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      <Button
        v-if="props.type === 'password'"
        variant="ghost"
        size="icon"
        type="button"
        @click="displayPassword = !displayPassword"
        class="h-6 w-10 hover:bg-transparent"
        aria-label="Toggle password visibility"
      >
        <EyeIcon
          v-if="displayPassword"
          class="size-4"
        />
        <EyeOffIcon
          v-else
          class="size-4"
        />
      </Button>
    </div>
  </div>
</template>
