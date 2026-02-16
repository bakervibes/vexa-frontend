<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useAttributes } from '@/composables/useAttributes'
import {
  useProductVariants,
  type AttributeWithOptions,
  type VariantInput,
} from '@/composables/useProductVariants'
import { ChevronDown, DollarSign, Package, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import BulkPriceDialog from './BulkPriceDialog.vue'
import BulkStockDialog from './BulkStockDialog.vue'

interface Props {
  modelValue: VariantInput[]
  isEditing?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: VariantInput[]): void
}>()

const { attributes } = useAttributes()
const { getOptionName } = useProductVariants()

// Selection state
const selectedIndexes = ref<Set<number>>(new Set())
const showBulkStockDialog = ref(false)
const showBulkPriceDialog = ref(false)

// Computed
const isAllSelected = computed(() => {
  return (
    props.modelValue.length > 0 &&
    selectedIndexes.value.size === props.modelValue.length
  )
})

const someSelected = computed(() => {
  return selectedIndexes.value.size > 0 && !isAllSelected.value
})

const selectedCount = computed(() => selectedIndexes.value.size)

const typedAttributes = computed(
  () => attributes.value as AttributeWithOptions[],
)

// Selection handlers
function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIndexes.value.clear()
  } else {
    props.modelValue.forEach((_, index) => {
      selectedIndexes.value.add(index)
    })
  }
}

function toggleVariant(index: number) {
  if (selectedIndexes.value.has(index)) {
    selectedIndexes.value.delete(index)
  } else {
    selectedIndexes.value.add(index)
  }
}

// Update variant field
function updateVariant(
  index: number,
  field: 'basePrice' | 'price' | 'stock',
  value: number,
) {
  const newVariants = [...props.modelValue]
  const variant = newVariants[index]
  if (variant) {
    newVariants[index] = { ...variant, [field]: value }
    emit('update:modelValue', newVariants)
  }
}

// Remove a single variant
function removeVariant(index: number) {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
  // Also remove from selection if it was selected
  selectedIndexes.value.delete(index)
  // Adjust indexes in selection that were after the removed one
  const newSelection = new Set<number>()
  selectedIndexes.value.forEach((i) => {
    if (i > index) {
      newSelection.add(i - 1)
    } else {
      newSelection.add(i)
    }
  })
  selectedIndexes.value = newSelection
}

// Remove selected variants
function removeSelectedVariants() {
  const indicesToRemove = Array.from(selectedIndexes.value).sort(
    (a, b) => b - a,
  )
  const updated = [...props.modelValue]
  indicesToRemove.forEach((index) => {
    updated.splice(index, 1)
  })
  emit('update:modelValue', updated)
  selectedIndexes.value.clear()
}

// Bulk apply stock
function handleBulkStockApply(stock: number) {
  const newVariants = props.modelValue.map((v, i) =>
    selectedIndexes.value.has(i) ? { ...v, stock } : v,
  )
  emit('update:modelValue', newVariants)
  selectedIndexes.value.clear()
  showBulkStockDialog.value = false
}

// Bulk apply price
function handleBulkPriceApply(data: { basePrice: number; price?: number }) {
  const newVariants = props.modelValue.map((v, i) =>
    selectedIndexes.value.has(i)
      ? { ...v, basePrice: data.basePrice, price: data.price }
      : v,
  )
  emit('update:modelValue', newVariants)
  selectedIndexes.value.clear()
  showBulkPriceDialog.value = false
}

// Get option label for display
function getOptionLabel(optionId: string): string {
  return getOptionName(optionId, typedAttributes.value)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Bulk actions toolbar -->
    <div
      v-if="selectedCount > 0"
      class="bg-muted flex items-center justify-between rounded-lg p-3"
    >
      <div class="flex items-center gap-3">
        <Checkbox
          :model-value="isAllSelected"
          :indeterminate="someSelected"
          @update:model-value="toggleSelectAll"
        />
        <span class="text-sm font-medium">
          {{ selectedCount }} variante(s) selectionnee(s)
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            size="sm"
            variant="outline"
          >
            Actions ({{ selectedCount }})
            <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="showBulkPriceDialog = true">
            <DollarSign class="mr-2 h-4 w-4" />
            Appliquer un prix
          </DropdownMenuItem>
          <DropdownMenuItem @click="showBulkStockDialog = true">
            <Package class="mr-2 h-4 w-4" />
            Appliquer un stock
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            class="text-destructive focus:text-destructive"
            @click="removeSelectedVariants"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Supprimer ({{ selectedCount }})
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <!-- Variants table -->
    <div class="rounded-md border">
      <table class="w-full">
        <thead>
          <tr class="bg-muted/50 border-b">
            <th class="h-10 w-12 px-4">
              <Checkbox
                :model-value="isAllSelected"
                :indeterminate="someSelected"
                @update:model-value="toggleSelectAll"
              />
            </th>
            <th
              class="text-muted-foreground h-10 px-4 text-left text-sm font-medium"
            >
              Combinaison
            </th>
            <th
              class="text-muted-foreground h-10 w-28 px-4 text-center text-sm font-medium"
            >
              Prix de base
            </th>
            <th
              class="text-muted-foreground h-10 w-28 px-4 text-center text-sm font-medium"
            >
              Prix de vente
            </th>
            <th
              class="text-muted-foreground h-10 w-24 px-4 text-center text-sm font-medium"
            >
              Stock
            </th>
            <th
              class="text-muted-foreground h-10 w-16 px-4 text-center text-sm font-medium"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(variant, index) in modelValue"
            :key="variant.combinationKey"
            class="hover:bg-muted/50 border-b transition-colors"
          >
            <td class="px-4 py-3">
              <Checkbox
                :model-value="selectedIndexes.has(index)"
                @update:model-value="toggleVariant(index)"
              />
            </td>
            <td class="px-4 py-3">
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="opt in variant.options"
                  :key="opt.optionId"
                  variant="secondary"
                >
                  {{ getOptionLabel(opt.optionId) }}
                </Badge>
              </div>
            </td>
            <td class="px-4 py-3">
              <Input
                :model-value="variant.basePrice"
                type="number"
                min="0"
                step="100"
                class="h-8 w-24 text-center"
                @update:model-value="
                  (val) => updateVariant(index, 'basePrice', Number(val) || 0)
                "
              />
            </td>
            <td class="px-4 py-3">
              <Input
                :model-value="variant.price ?? ''"
                type="number"
                min="0"
                step="100"
                class="h-8 w-24 text-center"
                placeholder="-"
                @update:model-value="
                  (val) =>
                    updateVariant(
                      index,
                      'price',
                      val ? Number(val) : (undefined as unknown as number),
                    )
                "
              />
            </td>
            <td class="px-4 py-3 text-center">
              <Input
                :model-value="variant.stock"
                type="number"
                min="0"
                class="h-8 w-20 text-center"
                @update:model-value="
                  (val) => updateVariant(index, 'stock', Number(val) || 0)
                "
              />
            </td>
            <td class="px-4 py-3 text-center">
              <Button
                variant="ghost"
                size="icon"
                class="text-muted-foreground hover:text-destructive h-8 w-8"
                @click="removeVariant(index)"
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div
      v-if="modelValue.length === 0"
      class="text-muted-foreground py-8 text-center text-sm"
    >
      Aucune combinaison generee. Selectionnez des attributs et options
      ci-dessus.
    </div>

    <!-- Bulk dialogs -->
    <BulkStockDialog
      v-model:open="showBulkStockDialog"
      :selected-count="selectedCount"
      @apply="handleBulkStockApply"
    />

    <BulkPriceDialog
      v-model:open="showBulkPriceDialog"
      :selected-count="selectedCount"
      @apply="handleBulkPriceApply"
    />
  </div>
</template>
