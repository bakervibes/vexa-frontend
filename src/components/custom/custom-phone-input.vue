<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/utils/lib'
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js'
import { Check } from 'lucide-vue-next'
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
  change: [e: Event]
  input: [e: Event]
}>()

const open = ref(false)
const selectedCountry = ref<CountryCode>(props.defaultCountry)
const internalValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

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

// Gestion de l'input avec le composant Input de shadcn
const handleInputUpdate = (value: string | number) => {
  let inputValue = String(value)

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

// Sélection d'un pays
const handleCountrySelect = (countryCode: CountryCode) => {
  selectedCountry.value = countryCode
  const newValue = `+${getCountryCallingCode(countryCode)}`
  internalValue.value = newValue
  emits('update:modelValue', newValue)
  open.value = false
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

    <div class="flex w-full flex-1 items-center gap-2 px-0.5">
      <Popover v-model:open="open">
        <PopoverTrigger
          as-child
          class="h-fit"
        >
          <Button
            type="button"
            variant="ghost"
            role="combobox"
            :aria-expanded="open"
            :disabled="disabled"
            size="sm"
            class="p-0! hover:bg-transparent"
          >
            <FlagComponent
              v-if="selectedCountry"
              :country="selectedCountry"
              :title="selectedCountryData?.label || selectedCountry"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-full max-w-lg p-0">
          <Command>
            <CommandInput placeholder="Rechercher un pays..." />
            <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  v-for="country in countries"
                  :key="country.value"
                  :value="country.label"
                  @select="handleCountrySelect(country.value)"
                  class="hover:bg-muted cursor-pointer py-2"
                >
                  <Check
                    :class="
                      cn(
                        'mr-1 h-4 w-4',
                        selectedCountry === country.value
                          ? 'opacity-100'
                          : 'opacity-0',
                      )
                    "
                  />
                  <div class="flex w-full items-center gap-2">
                    <span class="flex h-4 w-6 overflow-hidden rounded">
                      <FlagComponent
                        :country="country.value"
                        :title="country.label"
                      />
                    </span>
                    <div>
                      <span>
                        {{ country.label }}
                        <span class="text-muted-foreground ml-auto">
                          {{ country.indicatif }}
                        </span>
                      </span>
                    </div>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Input
        :id="inputId"
        ref="inputRef"
        :name="name"
        type="tel"
        :model-value="internalValue"
        @update:model-value="handleInputUpdate"
        @paste="handlePaste"
        :required="required"
        :disabled="disabled"
        class="w-full rounded-none border-none bg-transparent px-0 pb-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder=" "
      />
    </div>
  </div>
</template>
