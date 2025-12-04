<script setup lang="ts">
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next'
import Button from 'primevue/button'
import { computed, ref } from 'vue'

interface Props {
  id?: string
  label: string
  type?: string
  required?: boolean
  modelValue?: string | number
  // Props venant de vee-validate via v-bind="componentField"
  name?: string
  onBlur?: (e: FocusEvent) => void
  onChange?: (e: Event) => void
  onInput?: (e: Event) => void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  modelValue: '',
})

const emits = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [e: FocusEvent]
  change: [e: Event]
  input: [e: Event]
}>()

const displayPassword = ref(false)
const type = computed(() => {
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
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emits('update:modelValue', target.value)
  emits('input', e)
  props.onInput?.(e)
}

const handleChange = (e: Event) => {
  emits('change', e)
  props.onChange?.(e)
}
</script>

<template>
  <div class="relative w-full border-b border-gray-300">
    <input
      :id="inputId"
      :name="name"
      :type="type"
      :value="modelValue"
      @input="handleInput"
      @change="handleChange"
      :required="required"
      class="peer w-full border-none pt-8 pb-1 transition-all focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    />
    <label
      :for="inputId"
      class="pointer-events-none absolute top-0 left-0 text-sm text-gray-500 transition-all duration-200 ease-in-out"
    >
      {{ label }}
    </label>
    <Button
      v-if="props.type === 'password'"
      text
      plain
      type="button"
      @click="displayPassword = !displayPassword"
      class="absolute top-5 right-0 !p-2"
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
</template>
