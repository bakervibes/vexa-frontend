<script setup lang="ts">
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js'
import { Check, ChevronDownIcon } from 'lucide-vue-next'
import fr from 'react-phone-number-input/locale/fr.json'
import { computed, ref, watch } from 'vue'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import FlatComponent from './FlatComponent.vue'

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

const openCountry = ref(false)
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
const handleCountrySelect = (countryCode: CountryCode) => {
  selectedCountry.value = countryCode
  openCountry.value = false
  const newValue = `+${getCountryCallingCode(countryCode)}`
  internalValue.value = newValue
  emits('update:modelValue', newValue)
}
</script>

<template>
  <div class="relative flex w-full items-end gap-2 border-b border-gray-300">
    <!-- Country Selector -->
    <Popover
      v-model:open="openCountry"
      :modal="false"
    >
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="ghost"
          role="combobox"
          :aria-expanded="openCountry"
          :disabled="disabled"
          class="flex shrink-0 gap-1.5 px-0 hover:bg-transparent focus:ring-0"
        >
          <span
            class="flex h-5 w-7 overflow-hidden rounded [&_svg:not([class*='size-'])]:size-full"
          >
            <FlatComponent
              :country="selectedCountry"
              :title="selectedCountryData?.label || selectedCountry"
            />
          </span>
          <ChevronDownIcon class="-mr-1 size-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-80 p-0">
        <Command>
          <CommandInput placeholder="Rechercher un pays..." />
          <CommandList class="max-h-60">
            <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                v-for="country in countries"
                :key="country.value"
                :value="`${country.label} ${country.indicatif}`"
                @select="handleCountrySelect(country.value)"
                class="flex cursor-pointer items-center gap-2"
              >
                <span
                  class="flex h-5 w-7 overflow-hidden rounded [&_svg:not([class*='size-'])]:size-full"
                >
                  <FlatComponent
                    :country="country.value"
                    :title="country.label"
                  />
                </span>
                <span class="flex-1 text-sm">{{ country.label }}</span>
                <span class="text-foreground/50 text-sm">
                  {{ country.indicatif }}
                </span>
                <Check
                  :class="[
                    'ml-auto size-4',
                    selectedCountry === country.value
                      ? 'opacity-100'
                      : 'opacity-0',
                  ]"
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

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
