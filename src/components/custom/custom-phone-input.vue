<script setup lang="ts">
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js'
import Select from 'primevue/select'
import fr from 'react-phone-number-input/locale/fr.json'
import { computed, ref, watch } from 'vue'
import FlagComponent from './FlagComponent.vue'

interface Props {
  id?: string
  label: string
  required?: boolean
  modelValue?: string
  disabled?: boolean
  defaultCountry?: CountryCode
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  modelValue: '',
  disabled: false,
  defaultCountry: 'BJ',
})

const emits = defineEmits<{
  'update:modelValue': [value: string]
  blur: [e: FocusEvent]
  change: [e: Event]
  input: [e: Event]
}>()

const selectedCountry = ref<CountryCode>(props.defaultCountry)
const internalValue = ref('')

// Fonction pour obtenir les données du téléphone
const getPhoneData = (phone: string) => {
  const asYouType = new AsYouType()
  asYouType.input(phone)
  const number = asYouType.getNumber()

  return { isValid: number?.isValid(), country: number?.country }
}

// Liste des pays
const countries = computed(() => {
  return getCountries().map((countryCode) => ({
    value: countryCode,
    label: fr[countryCode] || countryCode,
    indicatif: `+${getCountryCallingCode(countryCode)}`,
  }))
})

// Indicatif du pays sélectionné
const countryCallingCode = computed(() =>
  getCountryCallingCode(selectedCountry.value),
)

// Données du pays sélectionné
const selectedCountryData = computed(() =>
  countries.value.find((c) => c.value === selectedCountry.value),
)

// Utilise soit l'id fourni, soit le name de vee-validate
const inputId = computed(
  () => props.id || props.name || `phone-input-${Math.random()}`,
)

// Initialisation de la valeur interne
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      internalValue.value = `+${countryCallingCode.value}`
    } else if (newValue !== internalValue.value) {
      internalValue.value = newValue
      const phoneData = getPhoneData(newValue)
      if (phoneData.country && phoneData.country !== selectedCountry.value) {
        selectedCountry.value = phoneData.country
      }
    }
  },
  { immediate: true },
)

// Mise à jour quand le pays change
watch(selectedCountry, () => {
  if (!internalValue.value.startsWith(`+${countryCallingCode.value}`)) {
    const newValue = `+${countryCallingCode.value}`
    internalValue.value = newValue
    emits('update:modelValue', newValue) // Émettre le code pays au lieu de ''
  }
})

// Gestion de l'input
const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let inputValue = target.value

  // Si l'utilisateur efface tout, réinitialiser au code pays
  if (inputValue.length < `+${countryCallingCode.value}`.length) {
    const newValue = `+${countryCallingCode.value}`
    internalValue.value = newValue
    emits('update:modelValue', newValue)
    return
  }

  // Si l'input ne commence pas par le bon code pays, le corriger
  if (!inputValue.startsWith(`+${countryCallingCode.value}`)) {
    inputValue = `+${countryCallingCode.value}${inputValue.replace(/^\+\d*/, '')}`
  }

  // Formater avec AsYouType
  const asYouType = new AsYouType(selectedCountry.value)
  const formattedValue = asYouType.input(inputValue)
  internalValue.value = formattedValue

  // Détecter automatiquement le changement de pays
  const phoneData = getPhoneData(formattedValue)
  if (phoneData.country && phoneData.country !== selectedCountry.value) {
    selectedCountry.value = phoneData.country
  }

  emits('update:modelValue', formattedValue)
}

// Gestion du paste
const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const clipboardData = e.clipboardData
  if (!clipboardData) return

  const pastedData = clipboardData.getData('text/plain')
  const asYouType = new AsYouType(selectedCountry.value)

  // Si le numéro collé contient déjà un indicatif, le détecter
  const testAsYouType = new AsYouType()
  testAsYouType.input(pastedData)
  const detectedCountry = testAsYouType.getNumber()?.country

  if (detectedCountry && detectedCountry !== selectedCountry.value) {
    selectedCountry.value = detectedCountry
    const formattedValue = new AsYouType(detectedCountry).input(pastedData)
    internalValue.value = formattedValue
    emits('update:modelValue', formattedValue)
  } else {
    const formattedValue = asYouType.input(
      `+${countryCallingCode.value}${pastedData.replace(/^\+\d+/, '')}`,
    )
    internalValue.value = formattedValue
    emits('update:modelValue', formattedValue)
  }
}

// Gestion du change (non utilisé, mais gardé pour la compatibilité)
const handleChange = (e: Event) => {
  // Vee-validate gère déjà le change via update:modelValue
}

// Sélection d'un pays
const handleCountrySelect = (event: any) => {
  const countryCode = event.value as CountryCode
  selectedCountry.value = countryCode
  const newValue = `+${getCountryCallingCode(countryCode)}`
  internalValue.value = newValue
  emits('update:modelValue', newValue)
}
</script>

<template>
  <div class="relative flex w-full items-end gap-2 border-b border-gray-300">
    <!-- Country Selector -->
    <Select
      v-model="selectedCountry"
      :options="countries"
      optionLabel="label"
      optionValue="value"
      filter
      :disabled="disabled"
      placeholder="Sélectionner un pays"
      @change="handleCountrySelect"
      class="shrink-0 !border-none"
      panelClass="w-80"
    >
      <template #value="slotProps">
        <div
          v-if="slotProps.value"
          class="flex items-center gap-1.5"
        >
          <span class="flex h-5 w-7 overflow-hidden rounded">
            <FlagComponent
              :country="slotProps.value"
              :title="selectedCountryData?.label || slotProps.value"
            />
          </span>
        </div>
      </template>
      <template #option="slotProps">
        <div class="flex items-center gap-2">
          <span class="flex h-5 w-7 overflow-hidden rounded">
            <FlagComponent
              :country="slotProps.option.value"
              :title="slotProps.option.label"
            />
          </span>
          <span class="flex-1 text-sm">{{ slotProps.option.label }}</span>
          <span class="text-sm text-gray-500">
            {{ slotProps.option.indicatif }}
          </span>
        </div>
      </template>
    </Select>

    <!-- Input with floating label -->
    <div class="flex-1">
      <input
        :id="inputId"
        :name="name"
        type="tel"
        pattern="[\d\s\-\(\)\+]+"
        :value="internalValue"
        @input="handleInput"
        @change="handleChange"
        @paste="handlePaste"
        @blur="emits('blur', $event)"
        :required="required"
        :disabled="disabled"
        class="peer w-full border-none pt-8 pb-1 transition-all focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        placeholder=" "
      />
      <label
        :for="inputId"
        class="pointer-events-none absolute top-0 left-0 text-sm text-gray-500 transition-all duration-200 ease-in-out"
      >
        {{ label }}
      </label>
    </div>
  </div>
</template>
