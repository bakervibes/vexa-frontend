<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAttributes } from '@/composables/useAttributes'
import {
  useProductVariants,
  type AttributeWithOptions,
  type VariantInput,
} from '@/composables/useProductVariants'
import { AlertTriangle, Check, Settings } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import AttributeSelector from './AttributeSelector.vue'
import VariantCombinationsTable from './VariantCombinationsTable.vue'

interface ExistingVariant {
  id: string
  basePrice: number
  price: number | null
  stock: number
  productVariantOptions?: {
    option: {
      id: string
      name: string
      attribute: {
        id: string
        name: string
      }
    }
  }[]
}

interface Props {
  modelValue: VariantInput[]
  isEditing?: boolean
  existingVariants?: ExistingVariant[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: VariantInput[]): void
  (e: 'update:step', step: number): void
}>()

const { attributes } = useAttributes()
const {
  generateCombinations,
  generateCombinationKey,
  isCombinationsCountHigh,
  getCombinationsCount,
  findAttributeForOption,
} = useProductVariants()

// Step state: 1 = attribute selection, 2 = pricing & stock
const currentStep = ref(1)

// Local state
const selectedAttributes = ref<Map<string, Set<string>>>(new Map())

// Typed attributes
const typedAttributes = computed(
  () => attributes.value as AttributeWithOptions[],
)

// Check if too many combinations
const combinationsCount = computed(() =>
  getCombinationsCount(selectedAttributes.value),
)
const isTooManyVariants = computed(() =>
  isCombinationsCountHigh(selectedAttributes.value, 100),
)

// Check if can proceed to step 2
const canProceedToStep2 = computed(() => {
  return combinationsCount.value >= 2 && !isTooManyVariants.value
})

// Emit step changes
watch(
  currentStep,
  (step) => {
    emit('update:step', step)
  },
  { immediate: true },
)

// Generate combinations when going to step 2 with intelligent merging
function goToStep2() {
  if (!canProceedToStep2.value) return

  // Generate new combinations from selected attributes
  const newCombinations = generateCombinations(
    selectedAttributes.value,
    typedAttributes.value,
  )

  // Create an index of existing variants by combinationKey
  const existingByKey = new Map(
    props.modelValue.map((v) => [v.combinationKey, v]),
  )

  // Merge: preserve price/stock if variant already existed
  const mergedVariants = newCombinations.map((newV) => {
    const existing = existingByKey.get(newV.combinationKey)
    if (existing) {
      // Preserve existing values
      return {
        ...newV,
        basePrice: existing.basePrice,
        price: existing.price,
        stock: existing.stock,
      }
    }
    // New variant with default values
    return newV
  })

  emit('update:modelValue', mergedVariants)
  currentStep.value = 2
}

// Go back to step 1 - reconstruct selectedAttributes from current variants
function goToStep1() {
  // Reconstruct the attributes/options map from current variants
  const attrMap = new Map<string, Set<string>>()

  for (const variant of props.modelValue) {
    for (const opt of variant.options) {
      const attr = findAttributeForOption(opt.optionId, typedAttributes.value)
      if (attr) {
        if (!attrMap.has(attr.id)) {
          attrMap.set(attr.id, new Set())
        }
        attrMap.get(attr.id)?.add(opt.optionId)
      }
    }
  }

  selectedAttributes.value = attrMap
  currentStep.value = 1
}

// Initialize from existing variants (edit mode)
watch(
  () => props.existingVariants,
  (variants) => {
    if (variants && variants.length > 0 && props.isEditing) {
      // Reconstruct selected attributes from existing variants
      const attrMap = new Map<string, Set<string>>()

      variants.forEach((variant) => {
        variant.productVariantOptions?.forEach((pvo) => {
          const attrId = pvo.option.attribute.id
          const optionId = pvo.option.id

          if (!attrMap.has(attrId)) {
            attrMap.set(attrId, new Set())
          }
          attrMap.get(attrId)?.add(optionId)
        })
      })

      selectedAttributes.value = attrMap

      // Also update the modelValue with existing variants data
      const existingInputs: VariantInput[] = variants.map((v) => {
        const optionIds = (v.productVariantOptions || []).map(
          (pvo) => pvo.option.id,
        )
        return {
          combinationKey: generateCombinationKey(optionIds),
          options: optionIds.map((optionId) => ({ optionId })),
          basePrice: v.basePrice,
          price: v.price ?? undefined,
          stock: v.stock,
        }
      })

      emit('update:modelValue', existingInputs)

      // Go directly to step 2 in edit mode
      currentStep.value = 2
    }
  },
  { immediate: true },
)

// Expose navigation methods to parent
defineExpose({
  goToStep1,
  goToStep2,
  canProceedToStep2,
})
</script>

<template>
  <div class="space-y-6">
    <!-- Step indicator -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <div
          :class="[
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
            currentStep === 1
              ? 'bg-primary text-primary-foreground'
              : currentStep > 1
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground',
          ]"
        >
          <Check
            v-if="currentStep > 1"
            class="h-4 w-4"
          />
          <span v-else>1</span>
        </div>
        <span
          :class="[
            'text-sm font-medium',
            currentStep >= 1 ? 'text-foreground' : 'text-muted-foreground',
          ]"
        >
          Attributs & Options
        </span>
      </div>

      <div class="bg-border h-px flex-1" />

      <div class="flex items-center gap-2">
        <div
          :class="[
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
            currentStep === 2
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          ]"
        >
          2
        </div>
        <span
          :class="[
            'text-sm font-medium',
            currentStep === 2 ? 'text-foreground' : 'text-muted-foreground',
          ]"
        >
          Prix & Stock
        </span>
      </div>
    </div>

    <!-- Step 1: Attribute Selection -->
    <div
      v-if="currentStep === 1"
      class="space-y-4"
    >
      <div class="rounded-lg border p-4">
        <!-- Warning for high combination count -->
        <div
          v-if="isTooManyVariants"
          class="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950"
        >
          <AlertTriangle class="h-4 w-4 shrink-0 text-amber-500" />
          <p class="text-sm text-amber-700 dark:text-amber-300">
            Attention : {{ combinationsCount }} combinaisons seront generees.
            Reduisez les options selectionnees (max 100).
          </p>
        </div>

        <AttributeSelector
          v-model="selectedAttributes"
          :combinations-count="combinationsCount"
          :can-generate="canProceedToStep2"
          @generate="goToStep2"
        />
      </div>

      <!-- Help text -->
      <p
        v-if="selectedAttributes.size === 0"
        class="text-muted-foreground text-center text-sm"
      >
        Ajoutez des attributs et selectionnez des options pour creer des
        variantes de ce produit.
      </p>

      <!-- Validation message -->
      <p
        v-else-if="!canProceedToStep2"
        class="text-muted-foreground text-center text-sm"
      >
        Selectionnez au moins deux options d'un même attribut pour continuer.
      </p>
    </div>

    <!-- Step 2: Pricing & Stock -->
    <div
      v-else-if="currentStep === 2"
      class="space-y-4"
    >
      <div class="rounded-lg border p-4">
        <div class="mb-4 flex items-center justify-between">
          <h4 class="font-medium">Definir les prix et stocks</h4>
          <div class="flex items-center gap-2">
            <Badge variant="secondary">
              {{ modelValue.length }} variante(s)
            </Badge>
            <Button
              variant="outline"
              size="sm"
              @click="goToStep1"
            >
              <Settings class="mr-2 h-4 w-4" />
              Modifier les attributs
            </Button>
          </div>
        </div>

        <p class="text-muted-foreground mb-4 text-sm">
          Entrez le prix de base (obligatoire), le prix de vente (optionnel) et
          le stock initial pour chaque variante.
        </p>

        <VariantCombinationsTable
          :model-value="modelValue"
          @update:model-value="emit('update:modelValue', $event)"
        />
      </div>
    </div>
  </div>
</template>
