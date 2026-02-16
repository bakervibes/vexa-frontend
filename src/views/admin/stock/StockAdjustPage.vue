<script setup lang="ts">
import { AdminPageHeader, EmptyState } from '@/components/admin/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { stockService } from '@/services/stock.service'
import type { StockMovementReason } from '@/validators/stock.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  History,
  Loader2,
  Minus,
  Package,
  Plus,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const productId = computed(() => route.params.id as string)

// Fetch product stock summary
const {
  data: stockSummary,
  isLoading: isLoadingProduct,
  error: productError,
} = useQuery({
  queryKey: computed(() => ['productStock', productId.value]),
  queryFn: () => stockService.getProductStockSummary(productId.value),
  enabled: computed(() => !!productId.value),
})

// Fetch stock movements for this product
const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
  queryKey: computed(() => ['stockMovements', productId.value]),
  queryFn: () =>
    stockService.getMovements({ productId: productId.value, limit: 10 }),
  enabled: computed(() => !!productId.value),
})

const movements = computed(() => movementsData.value?.data || [])

// Form state
const adjustmentType = ref<'add' | 'remove'>('add')
const quantity = ref(1)
const reason = ref<StockMovementReason>('MANUAL_ADJUSTMENT')
const note = ref('')

// Selection state
const selectedVariantIds = ref<Set<string>>(new Set())
const adjustMainProduct = ref(false)

// Computed properties
const hasVariants = computed(
  () => (stockSummary.value?.variants?.length || 0) > 0,
)

const totalSelected = computed(() => {
  let count = selectedVariantIds.value.size
  if (adjustMainProduct.value && !hasVariants.value) count++
  return count
})

const isAllSelected = computed(() => {
  if (!stockSummary.value?.variants) return false
  return selectedVariantIds.value.size === stockSummary.value.variants.length
})

const canSubmit = computed(() => {
  if (quantity.value < 1) return false
  if (adjustmentType.value === 'remove' && !note.value.trim()) return false
  if (hasVariants.value) {
    return selectedVariantIds.value.size > 0
  }
  return true
})

// Watch for adjustment type changes to require note on removal
watch(adjustmentType, (newType) => {
  if (newType === 'add') {
    // Clear note requirement indicator
  }
})

// Selection handlers
function toggleSelectAll() {
  if (!stockSummary.value?.variants) return

  if (isAllSelected.value) {
    selectedVariantIds.value.clear()
  } else {
    stockSummary.value.variants.forEach((v) => {
      selectedVariantIds.value.add(v.id)
    })
  }
}

function toggleVariant(variantId: string) {
  if (selectedVariantIds.value.has(variantId)) {
    selectedVariantIds.value.delete(variantId)
  } else {
    selectedVariantIds.value.add(variantId)
  }
}

// Mutations
const adjustMutation = useMutation({
  mutationFn: async () => {
    if (hasVariants.value && selectedVariantIds.value.size > 0) {
      // Bulk adjust variants
      const adjustments = Array.from(selectedVariantIds.value).map(
        (variantId) => {
          const variant = stockSummary.value?.variants.find(
            (v) => v.id === variantId,
          )
          const currentStock = variant?.stock || 0
          const newStock =
            adjustmentType.value === 'add'
              ? currentStock + quantity.value
              : Math.max(0, currentStock - quantity.value)

          return {
            productId: productId.value,
            variantId,
            newStock,
          }
        },
      )

      return stockService.bulkAdjustStock(adjustments, reason.value, note.value)
    } else {
      // Single product adjustment
      const currentStock = stockSummary.value?.product.stock || 0
      const newStock =
        adjustmentType.value === 'add'
          ? currentStock + quantity.value
          : Math.max(0, currentStock - quantity.value)

      return stockService.adjustStock({
        productId: productId.value,
        newStock,
        reason: reason.value,
        note: note.value || undefined,
      })
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['productStock'] })
    queryClient.invalidateQueries({ queryKey: ['stockMovements'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] })
    toast.success('Stock ajusté avec succès')

    // Reset form
    quantity.value = 1
    note.value = ''
    selectedVariantIds.value.clear()
  },
  onError: (error: Error) => {
    toast.error(error.message || "Erreur lors de l'ajustement du stock")
  },
})

function handleSubmit() {
  if (!canSubmit.value) {
    if (adjustmentType.value === 'remove' && !note.value.trim()) {
      toast.error('Une raison est requise pour les retraits de stock')
      return
    }
    return
  }
  adjustMutation.mutate()
}

// Utility functions
function getStockBadge(stock: number) {
  if (stock === 0) return { label: 'Rupture', variant: 'destructive' as const }
  if (stock <= 10) return { label: 'Stock bas', variant: 'outline' as const }
  return { label: 'En stock', variant: 'default' as const }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getMovementTypeBadge(type: string) {
  const types: Record<
    string,
    {
      label: string
      variant: 'default' | 'secondary' | 'destructive' | 'outline'
    }
  > = {
    ADDITION: { label: 'Ajout', variant: 'default' },
    DEDUCTION: { label: 'Retrait', variant: 'destructive' },
    ADJUSTMENT: { label: 'Ajustement', variant: 'secondary' },
    SALE: { label: 'Vente', variant: 'destructive' },
    RETURN: { label: 'Retour', variant: 'default' },
    DAMAGED: { label: 'Endommagé', variant: 'destructive' },
  }
  return types[type] || { label: type, variant: 'secondary' as const }
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Ajuster le stock"
      :description="stockSummary?.product.name || 'Chargement...'"
    >
      <template #actions>
        <Button
          variant="outline"
          @click="router.back()"
        >
          <ArrowLeft class="mr-2 h-4 w-4" />
          Retour
        </Button>
      </template>
    </AdminPageHeader>

    <!-- Loading state -->
    <div
      v-if="isLoadingProduct"
      class="flex h-64 items-center justify-center"
    >
      <Loader2 class="text-muted-foreground h-8 w-8 animate-spin" />
    </div>

    <!-- Error state -->
    <Card v-else-if="productError">
      <CardContent class="py-8">
        <EmptyState
          title="Produit introuvable"
          description="Le produit demandé n'existe pas ou a été supprimé."
          :icon="Package"
        />
      </CardContent>
    </Card>

    <!-- Content -->
    <template v-else-if="stockSummary">
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Left column: Stock info + Adjustment form -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Product summary -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center justify-between">
                <span>{{ stockSummary.product.name }}</span>
                <Badge
                  :variant="getStockBadge(stockSummary.product.stock).variant"
                >
                  {{ stockSummary.product.stock }} unités
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent v-if="hasVariants">
              <p class="text-muted-foreground text-sm">
                Ce produit a {{ stockSummary.variants.length }} variante(s). Le
                stock total des variantes est de
                <strong>{{ stockSummary.product.totalVariantStock }}</strong>
                unités.
              </p>
            </CardContent>
          </Card>

          <!-- Variants table (if any) -->
          <Card v-if="hasVariants">
            <CardHeader>
              <CardTitle class="flex items-center justify-between">
                <span>Variantes</span>
                <span
                  v-if="totalSelected > 0"
                  class="text-muted-foreground text-sm font-normal"
                >
                  {{ totalSelected }} sélectionnée(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="rounded-md border">
                <table class="w-full">
                  <thead>
                    <tr class="bg-muted/50 border-b">
                      <th class="h-10 w-12 px-4">
                        <Checkbox
                          :model-value="isAllSelected"
                          @update:model-value="toggleSelectAll"
                        />
                      </th>
                      <th
                        class="text-muted-foreground h-10 px-4 text-left text-sm font-medium"
                      >
                        Combinaison
                      </th>
                      <th
                        class="text-muted-foreground h-10 px-4 text-center text-sm font-medium"
                      >
                        Stock actuel
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="variant in stockSummary.variants"
                      :key="variant.id"
                      class="hover:bg-muted/50 border-b transition-colors"
                    >
                      <td class="px-4 py-3">
                        <Checkbox
                          :model-value="selectedVariantIds.has(variant.id)"
                          @update:model-value="toggleVariant(variant.id)"
                        />
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex flex-wrap gap-1">
                          <Badge
                            v-for="opt in variant.options"
                            :key="opt.attribute"
                            variant="secondary"
                          >
                            {{ opt.attribute }}: {{ opt.value }}
                          </Badge>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-center">
                        <Badge :variant="getStockBadge(variant.stock).variant">
                          {{ variant.stock }}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <!-- Adjustment form -->
          <Card>
            <CardHeader>
              <CardTitle>Ajustement</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Type selection -->
              <div class="flex gap-4">
                <Button
                  :variant="adjustmentType === 'add' ? 'default' : 'outline'"
                  class="flex-1"
                  @click="adjustmentType = 'add'"
                >
                  <Plus class="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
                <Button
                  :variant="
                    adjustmentType === 'remove' ? 'destructive' : 'outline'
                  "
                  class="flex-1"
                  @click="adjustmentType = 'remove'"
                >
                  <Minus class="mr-2 h-4 w-4" />
                  Retirer
                </Button>
              </div>

              <!-- Quantity -->
              <div class="space-y-2">
                <Label for="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  v-model.number="quantity"
                  type="number"
                  min="1"
                  placeholder="Quantité à ajuster"
                />
              </div>

              <!-- Reason -->
              <div class="space-y-2">
                <Label for="reason">Raison</Label>
                <Select v-model="reason">
                  <SelectTrigger id="reason">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUAL_ADJUSTMENT">
                      Ajustement manuel
                    </SelectItem>
                    <SelectItem value="INVENTORY_COUNT">
                      Inventaire physique
                    </SelectItem>
                    <SelectItem value="DAMAGED_GOODS">
                      Marchandise endommagée
                    </SelectItem>
                    <SelectItem value="OTHER">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Note (required for removal) -->
              <div class="space-y-2">
                <Label for="note">
                  Note
                  <span
                    v-if="adjustmentType === 'remove'"
                    class="text-destructive"
                  >
                    *
                  </span>
                </Label>
                <Textarea
                  id="note"
                  v-model="note"
                  :placeholder="
                    adjustmentType === 'remove'
                      ? 'Raison du retrait (obligatoire)...'
                      : 'Note optionnelle...'
                  "
                  rows="2"
                />
                <p
                  v-if="adjustmentType === 'remove' && !note.trim()"
                  class="text-destructive text-xs"
                >
                  Une note est obligatoire pour les retraits de stock
                </p>
              </div>

              <!-- Preview -->
              <div
                v-if="quantity > 0"
                class="bg-muted rounded-lg p-3"
              >
                <p class="text-muted-foreground text-sm">
                  <template v-if="hasVariants && totalSelected > 0">
                    {{ totalSelected }} variante(s) sélectionnée(s) :
                    <span
                      :class="
                        adjustmentType === 'add'
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                    >
                      {{ adjustmentType === 'add' ? '+' : '-' }}{{ quantity }}
                      unité(s) chacune
                    </span>
                  </template>
                  <template v-else-if="!hasVariants">
                    Stock principal :
                    <span
                      :class="
                        adjustmentType === 'add'
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                    >
                      {{ stockSummary.product.stock }} →
                      {{
                        adjustmentType === 'add'
                          ? stockSummary.product.stock + quantity
                          : Math.max(0, stockSummary.product.stock - quantity)
                      }}
                    </span>
                  </template>
                  <template v-else>Sélectionnez au moins une variante</template>
                </p>
              </div>

              <!-- Submit -->
              <Button
                class="w-full"
                :disabled="!canSubmit || adjustMutation.isPending.value"
                @click="handleSubmit"
              >
                <Loader2
                  v-if="adjustMutation.isPending.value"
                  class="mr-2 h-4 w-4 animate-spin"
                />
                Confirmer l'ajustement
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Right column: Stock history -->
        <div>
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <History class="h-5 w-5" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                v-if="isLoadingMovements"
                class="flex h-32 items-center justify-center"
              >
                <Loader2 class="text-muted-foreground h-6 w-6 animate-spin" />
              </div>

              <div
                v-else-if="movements.length === 0"
                class="py-8"
              >
                <EmptyState
                  title="Aucun mouvement"
                  description="L'historique apparaîtra ici"
                  :icon="History"
                />
              </div>

              <div
                v-else
                class="space-y-3"
              >
                <div
                  v-for="movement in movements"
                  :key="movement.id"
                  class="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div
                    :class="[
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      movement.quantity > 0
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600',
                    ]"
                  >
                    <ArrowUp
                      v-if="movement.quantity > 0"
                      class="h-4 w-4"
                    />
                    <ArrowDown
                      v-else
                      class="h-4 w-4"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <Badge
                        :variant="getMovementTypeBadge(movement.type).variant"
                        class="text-xs"
                      >
                        {{ getMovementTypeBadge(movement.type).label }}
                      </Badge>
                      <span class="text-sm font-medium">
                        {{ movement.quantity > 0 ? '+' : ''
                        }}{{ movement.quantity }}
                      </span>
                    </div>
                    <p class="text-muted-foreground mt-1 text-xs">
                      {{ movement.previousStock }} → {{ movement.newStock }}
                    </p>
                    <p
                      v-if="movement.note"
                      class="text-muted-foreground mt-1 truncate text-xs"
                    >
                      {{ movement.note }}
                    </p>
                    <p class="text-muted-foreground mt-1 text-xs">
                      {{ formatDate(movement.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </template>
  </div>
</template>
