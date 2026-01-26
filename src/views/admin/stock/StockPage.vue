<script setup lang="ts">
import { AdminPageHeader, EmptyState } from '@/components/admin/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useLowStockProducts } from '@/composables/useAdmin'
import { stockService, type StockMovement } from '@/services/stock.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  Package,
  RefreshCw,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const queryClient = useQueryClient()

// Low stock products
const { lowStockProducts, isLoading: isLoadingLowStock } =
  useLowStockProducts(50)

// Stock movements history
const movementsPage = ref(1)
const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
  queryKey: computed(() => ['stockMovements', movementsPage.value]),
  queryFn: () =>
    stockService.getMovements({ page: movementsPage.value, limit: 20 }),
})

const movements = computed(() => movementsData.value?.data || [])
const movementsPagination = computed(() => movementsData.value?.meta)

// Adjustment dialog
const isAdjustDialogOpen = ref(false)
const selectedProduct = ref<{
  id: string
  name: string
  stock: number
  variantId?: string
  variantName?: string
} | null>(null)
const adjustmentForm = ref({
  newStock: 0,
  reason: 'MANUAL_ADJUSTMENT' as const,
  note: '',
})

const adjustMutation = useMutation({
  mutationFn: () =>
    stockService.adjustStock({
      productId: selectedProduct.value!.id,
      variantId: selectedProduct.value?.variantId,
      newStock: adjustmentForm.value.newStock,
      reason: adjustmentForm.value.reason,
      note: adjustmentForm.value.note || undefined,
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] })
    queryClient.invalidateQueries({ queryKey: ['stockMovements'] })
    queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    toast.success('Stock ajusté avec succès')
    closeAdjustDialog()
  },
  onError: () => {
    toast.error("Erreur lors de l'ajustement du stock")
  },
})

function openAdjustDialog(product: {
  id: string
  name: string
  stock: number
  variantId?: string
  variantName?: string
}) {
  selectedProduct.value = product
  adjustmentForm.value = {
    newStock: product.stock,
    reason: 'MANUAL_ADJUSTMENT',
    note: '',
  }
  isAdjustDialogOpen.value = true
}

function closeAdjustDialog() {
  isAdjustDialogOpen.value = false
  selectedProduct.value = null
}

function handleAdjust() {
  if (!selectedProduct.value) return
  adjustMutation.mutate()
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

function getStockBadge(stock: number) {
  if (stock === 0) return { label: 'Rupture', variant: 'destructive' as const }
  if (stock <= 10) return { label: 'Stock bas', variant: 'outline' as const }
  return { label: 'En stock', variant: 'default' as const }
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
    RESERVATION: { label: 'Réservation', variant: 'outline' },
    RELEASE: { label: 'Libération', variant: 'default' },
    SALE: { label: 'Vente', variant: 'destructive' },
    RETURN: { label: 'Retour', variant: 'default' },
    DAMAGED: { label: 'Endommagé', variant: 'destructive' },
  }
  return types[type] || { label: type, variant: 'secondary' as const }
}

function getReasonLabel(reason: string): string {
  const reasons: Record<string, string> = {
    INITIAL_STOCK: 'Stock initial',
    PURCHASE_ORDER: 'Commande fournisseur',
    CART_RESERVATION: 'Réservation panier',
    CART_RELEASE: 'Libération panier',
    ORDER_COMPLETED: 'Commande terminée',
    ORDER_CANCELLED: 'Commande annulée',
    PAYMENT_FAILED: 'Échec paiement',
    MANUAL_ADJUSTMENT: 'Ajustement manuel',
    INVENTORY_COUNT: 'Inventaire',
    DAMAGED_GOODS: 'Marchandise endommagée',
    RETURN_REFUND: 'Retour client',
    OTHER: 'Autre',
  }
  return reasons[reason] || reason
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Gestion des stocks"
      description="Visualisez et ajustez les niveaux de stock"
    >
      <template #actions>
        <Button
          variant="outline"
          @click="
            queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] })
          "
        >
          <RefreshCw class="mr-2 h-4 w-4" />
          Actualiser
        </Button>
      </template>
    </AdminPageHeader>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Low Stock Products -->
      <div class="bg-card rounded-xl border">
        <div class="flex items-center justify-between border-b p-4">
          <div class="flex items-center gap-2">
            <AlertTriangle class="h-5 w-5 text-amber-500" />
            <h3 class="font-semibold">Produits en stock bas</h3>
          </div>
          <Badge variant="secondary">
            {{ lowStockProducts.length }} produits
          </Badge>
        </div>

        <div
          v-if="isLoadingLowStock"
          class="flex h-48 items-center justify-center"
        >
          <Loader2 class="text-muted-foreground h-6 w-6 animate-spin" />
        </div>

        <div
          v-else-if="lowStockProducts.length === 0"
          class="p-8"
        >
          <EmptyState
            title="Aucun produit en stock bas"
            description="Tous vos produits ont un niveau de stock suffisant"
            :icon="Package"
          />
        </div>

        <div
          v-else
          class="max-h-[400px] divide-y overflow-y-auto"
        >
          <div
            v-for="product in lowStockProducts"
            :key="product.id"
            class="hover:bg-muted/50 flex items-center justify-between p-4"
          >
            <div class="flex items-center gap-3">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="h-10 w-10 rounded object-cover"
              />
              <div
                class="bg-muted flex h-10 w-10 items-center justify-center rounded"
                v-else
              >
                <Package class="text-muted-foreground h-5 w-5" />
              </div>
              <div>
                <p class="line-clamp-1 font-medium">{{ product.name }}</p>
                <p class="text-muted-foreground text-sm">
                  {{ product.category }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Badge :variant="getStockBadge(product.stock).variant">
                {{ product.stock }} unités
              </Badge>
              <Button
                size="sm"
                variant="outline"
                @click="
                  openAdjustDialog({
                    id: product.id,
                    name: product.name,
                    stock: product.stock,
                  })
                "
              >
                Ajuster
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Stock Movements -->
      <div class="bg-card rounded-xl border">
        <div class="flex items-center justify-between border-b p-4">
          <div class="flex items-center gap-2">
            <History class="text-muted-foreground h-5 w-5" />
            <h3 class="font-semibold">Historique des mouvements</h3>
          </div>
        </div>

        <div
          v-if="isLoadingMovements"
          class="flex h-48 items-center justify-center"
        >
          <Loader2 class="text-muted-foreground h-6 w-6 animate-spin" />
        </div>

        <div
          v-else-if="movements.length === 0"
          class="p-8"
        >
          <EmptyState
            title="Aucun mouvement"
            description="L'historique des mouvements de stock apparaîtra ici"
            :icon="History"
          />
        </div>

        <div v-else>
          <div class="max-h-[350px] divide-y overflow-y-auto">
            <div
              v-for="movement in movements"
              :key="movement.id"
              class="flex items-center justify-between p-4"
            >
              <div class="flex items-center gap-3">
                <div
                  :class="[
                    'flex h-8 w-8 items-center justify-center rounded-full',
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
                <div>
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
                  <p class="text-muted-foreground text-xs">
                    {{ getReasonLabel(movement.reason) }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm">
                  {{ movement.previousStock }} → {{ movement.newStock }}
                </p>
                <p class="text-muted-foreground text-xs">
                  {{ formatDate(movement.createdAt) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div
            v-if="movementsPagination && movementsPagination.totalPages > 1"
            class="flex items-center justify-between border-t p-4"
          >
            <p class="text-muted-foreground text-sm">
              Page {{ movementsPagination.page }} /
              {{ movementsPagination.totalPages }}
            </p>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="movementsPagination.page <= 1"
                @click="movementsPage--"
              >
                <ChevronLeft class="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                :disabled="
                  movementsPagination.page >= movementsPagination.totalPages
                "
                @click="movementsPage++"
              >
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Adjust Stock Dialog -->
    <Dialog v-model:open="isAdjustDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajuster le stock</DialogTitle>
          <DialogDescription>
            {{ selectedProduct?.name }}
            <span v-if="selectedProduct?.variantName">
              - {{ selectedProduct.variantName }}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div
            class="bg-muted flex items-center justify-between rounded-lg p-3"
          >
            <span class="text-muted-foreground text-sm">Stock actuel</span>
            <Badge
              :variant="getStockBadge(selectedProduct?.stock || 0).variant"
            >
              {{ selectedProduct?.stock }} unités
            </Badge>
          </div>

          <div class="space-y-2">
            <Label for="new-stock">Nouveau stock</Label>
            <Input
              id="new-stock"
              v-model.number="adjustmentForm.newStock"
              type="number"
              min="0"
            />
          </div>

          <div class="space-y-2">
            <Label for="reason">Raison</Label>
            <Select v-model="adjustmentForm.reason">
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

          <div class="space-y-2">
            <Label for="note">Note (optionnel)</Label>
            <Textarea
              id="note"
              v-model="adjustmentForm.note"
              placeholder="Raison de l'ajustement..."
              rows="2"
            />
          </div>

          <div
            v-if="
              selectedProduct &&
              adjustmentForm.newStock !== selectedProduct.stock
            "
            class="flex items-center justify-between rounded-lg border p-3"
          >
            <span class="text-sm">Changement</span>
            <span
              :class="[
                'font-medium',
                adjustmentForm.newStock > selectedProduct.stock
                  ? 'text-green-600'
                  : 'text-red-600',
              ]"
            >
              {{ adjustmentForm.newStock > selectedProduct.stock ? '+' : ''
              }}{{ adjustmentForm.newStock - selectedProduct.stock }} unités
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="closeAdjustDialog"
          >
            Annuler
          </Button>
          <Button
            :disabled="
              adjustMutation.isPending.value ||
              adjustmentForm.newStock === selectedProduct?.stock
            "
            @click="handleAdjust"
          >
            <Loader2
              v-if="adjustMutation.isPending.value"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
