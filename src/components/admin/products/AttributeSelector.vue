<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAttributes } from '@/composables/useAttributes'
import type { AttributeWithOptions } from '@/composables/useProductVariants'
import { AlertTriangle, Plus, SettingsIcon, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

interface Props {
  modelValue: Map<string, Set<string>>
  disabled?: boolean
  combinationsCount?: number
  canGenerate?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Map<string, Set<string>>): void
  (e: 'generate'): void
}>()

const { attributes, isLoading } = useAttributes()

// Local state for added attributes
const addedAttributeIds = ref<string[]>([])
const showAddPopover = ref(false)

// Filter active attributes with options
const activeAttributes = computed(() => {
  return (attributes.value as AttributeWithOptions[]).filter(
    (attr) => attr.isActive && attr.options && attr.options.length > 0,
  )
})

// Attributes available for adding (not yet added)
const availableAttributes = computed(() => {
  return activeAttributes.value.filter(
    (attr) => !addedAttributeIds.value.includes(attr.id),
  )
})

// Get attribute by id
function getAttribute(attributeId: string): AttributeWithOptions | undefined {
  return activeAttributes.value.find((attr) => attr.id === attributeId)
}

// Add an attribute to the selection
function addAttribute(attributeId: string) {
  if (!addedAttributeIds.value.includes(attributeId)) {
    addedAttributeIds.value.push(attributeId)
    // Initialize empty set for this attribute
    const newMap = new Map(props.modelValue)
    newMap.set(attributeId, new Set())
    emit('update:modelValue', newMap)
  }
  showAddPopover.value = false
}

// Remove an attribute from the selection
function removeAttribute(attributeId: string) {
  addedAttributeIds.value = addedAttributeIds.value.filter(
    (id) => id !== attributeId,
  )
  const newMap = new Map(props.modelValue)
  newMap.delete(attributeId)
  emit('update:modelValue', newMap)
}

// Toggle an option
function toggleOption(attributeId: string, optionId: string) {
  const newMap = new Map(props.modelValue)
  const currentSet = newMap.get(attributeId) || new Set()
  const newSet = new Set(currentSet)

  if (newSet.has(optionId)) {
    newSet.delete(optionId)
  } else {
    newSet.add(optionId)
  }

  newMap.set(attributeId, newSet)
  emit('update:modelValue', newMap)
}

// Check if an option is selected
function isOptionSelected(attributeId: string, optionId: string): boolean {
  return props.modelValue.get(attributeId)?.has(optionId) || false
}

// Count selected options for an attribute
function getSelectedCount(attributeId: string): number {
  return props.modelValue.get(attributeId)?.size || 0
}

// Initialize from existing modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    const attributeIds = Array.from(newValue.keys())
    addedAttributeIds.value = attributeIds.filter((id) =>
      activeAttributes.value.some((attr) => attr.id === id),
    )
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <Label class="text-sm font-medium">Attributs & Options</Label>

      <div class="flex items-center gap-2">
        <Badge
          v-if="addedAttributeIds.length > 0"
          variant="secondary"
        >
          {{ addedAttributeIds.length }} attribut(s)
        </Badge>
        <Badge
          v-if="props.combinationsCount && props.combinationsCount > 0"
          variant="outline"
        >
          {{ props.combinationsCount }} variante(s)
        </Badge>

        <Button
          variant="outline"
          size="sm"
          :disabled="!props.canGenerate"
          @click="emit('generate')"
        >
          <SettingsIcon class="mr-2 h-4 w-4" />
          Générer les combinaisons
        </Button>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="text-muted-foreground text-sm"
    >
      Chargement des attributs...
    </div>

    <!-- No attributes available -->
    <div
      v-else-if="activeAttributes.length === 0"
      class="bg-muted/50 flex items-center gap-2 rounded-lg p-4"
    >
      <AlertTriangle class="h-4 w-4 text-amber-500" />
      <p class="text-muted-foreground text-sm">
        Aucun attribut disponible.
        <RouterLink
          to="/admin/attributes"
          class="text-primary underline"
        >
          Créez des attributs
        </RouterLink>
        avant de définir des variantes.
      </p>
    </div>

    <!-- Attributes list -->
    <template v-else>
      <!-- Added attributes -->
      <div
        v-for="attributeId in addedAttributeIds"
        :key="attributeId"
        class="rounded-lg border p-4"
      >
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-medium">
              {{ getAttribute(attributeId)?.name }}
            </span>
            <Badge
              v-if="getSelectedCount(attributeId) > 0"
              variant="secondary"
              class="text-xs"
            >
              {{ getSelectedCount(attributeId) }} option(s)
            </Badge>
          </div>
          <Button
            v-if="!disabled"
            variant="ghost"
            size="icon"
            class="h-8 w-8"
            @click="removeAttribute(attributeId)"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>

        <!-- Options checkboxes -->
        <div class="flex flex-wrap gap-3">
          <div
            v-for="option in getAttribute(attributeId)?.options.filter(
              (o) => o.isActive,
            )"
            :key="option.id"
            class="flex items-center gap-2"
          >
            <Checkbox
              :id="`option-${option.id}`"
              :model-value="isOptionSelected(attributeId, option.id)"
              :disabled="disabled"
              @update:model-value="toggleOption(attributeId, option.id)"
            />
            <Label
              :for="`option-${option.id}`"
              class="cursor-pointer text-sm"
            >
              {{ option.name }}
            </Label>
          </div>
        </div>

        <!-- No active options -->
        <p
          v-if="
            getAttribute(attributeId)?.options.filter((o) => o.isActive)
              .length === 0
          "
          class="text-muted-foreground text-sm"
        >
          Aucune option active pour cet attribut.
        </p>
      </div>

      <!-- Add attribute button -->
      <Popover v-model:open="showAddPopover">
        <PopoverTrigger as-child>
          <Button
            v-if="!disabled && availableAttributes.length > 0"
            variant="outline"
            class="w-full"
          >
            <Plus class="mr-2 h-4 w-4" />
            Ajouter un attribut
          </Button>
        </PopoverTrigger>
        <PopoverContent
          class="w-64 p-2"
          align="start"
        >
          <div class="space-y-1">
            <p class="text-muted-foreground mb-2 text-xs font-medium">
              Sélectionnez un attribut
            </p>
            <Button
              v-for="attr in availableAttributes"
              :key="attr.id"
              variant="ghost"
              class="w-full justify-start"
              @click="addAttribute(attr.id)"
            >
              {{ attr.name }}
              <Badge
                variant="secondary"
                class="ml-auto text-xs"
              >
                {{ attr.options.filter((o) => o.isActive).length }} options
              </Badge>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- All attributes added -->
      <p
        v-if="
          !disabled &&
          availableAttributes.length === 0 &&
          addedAttributeIds.length > 0
        "
        class="text-muted-foreground text-center text-sm"
      >
        Tous les attributs ont été ajoutés.
      </p>
    </template>
  </div>
</template>
