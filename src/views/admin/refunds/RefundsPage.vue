<script setup lang="ts">
import { OrderStatusBadge } from '@/components/admin/orders'
import {
  AdminPageHeader,
  ConfirmDialog,
  StatCard,
} from '@/components/admin/shared'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  refundsService,
  type RefundFilters,
  type RefundRequest,
} from '@/services/refunds.service'
import type { OrderStatus } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  XCircle,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const queryClient = useQueryClient()

const filters = ref<RefundFilters>({
  page: 1,
  limit: 20,
  status: 'pending',
})

const { data, isLoading } = useQuery({
  queryKey: computed(() => ['admin', 'refunds', filters.value]),
  queryFn: () => refundsService.getRefunds(filters.value),
  staleTime: 1000 * 60 * 2,
})

const { data: stats, isLoading: isLoadingStats } = useQuery({
  queryKey: ['admin', 'refunds', 'stats'],
  queryFn: () => refundsService.getStats(),
  staleTime: 1000 * 60 * 5,
})

const refunds = computed(() => data.value?.refunds || [])
const pagination = computed(() => data.value?.pagination || null)

// UI state
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const selectedRefund = ref<RefundRequest | null>(null)
const rejectReason = ref('')

const approveMutation = useMutation({
  mutationFn: (orderId: string) => refundsService.approveRefund(orderId),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] })
    toast.success('Remboursement approuvé')
    showApproveDialog.value = false
    selectedRefund.value = null
  },
  onError: (error: Error) => {
    toast.error(error.message || "Erreur lors de l'approbation")
  },
})

const rejectMutation = useMutation({
  mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
    refundsService.rejectRefund(orderId, reason),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'refunds'] })
    toast.success('Demande rejetée')
    showRejectDialog.value = false
    selectedRefund.value = null
    rejectReason.value = ''
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Erreur lors du rejet')
  },
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value)
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

function handleApprove(refund: RefundRequest) {
  selectedRefund.value = refund
  showApproveDialog.value = true
}

function handleReject(refund: RefundRequest) {
  selectedRefund.value = refund
  rejectReason.value = ''
  showRejectDialog.value = true
}

function confirmApprove() {
  if (selectedRefund.value) {
    approveMutation.mutate(selectedRefund.value.id)
  }
}

function confirmReject() {
  if (selectedRefund.value) {
    rejectMutation.mutate({
      orderId: selectedRefund.value.id,
      reason: rejectReason.value || undefined,
    })
  }
}

function setStatusFilter(status: unknown) {
  filters.value = {
    ...filters.value,
    status: status as string as RefundFilters['status'],
    page: 1,
  }
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Remboursements"
      description="Gérez les demandes de remboursement"
    />

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-3">
      <StatCard
        title="En attente"
        :value="stats?.pending ?? 0"
        :loading="isLoadingStats"
        :icon="Clock"
        variant="warning"
      />
      <StatCard
        title="Approuvés"
        :value="stats?.approved ?? 0"
        :loading="isLoadingStats"
        :icon="CheckCircle"
        variant="success"
      />
      <StatCard
        title="Total remboursé"
        :value="formatCurrency(stats?.totalRefunded ?? 0)"
        :loading="isLoadingStats"
        :icon="DollarSign"
      />
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <Select
        :model-value="filters.status || 'pending'"
        @update:model-value="setStatusFilter"
      >
        <SelectTrigger class="w-48">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">En attente</SelectItem>
          <SelectItem value="processed">Traitées</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Refunds Table -->
    <div class="rounded-md border">
      <table class="w-full">
        <thead>
          <tr class="bg-muted/50 border-b">
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Commande
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Client
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Montant
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Statut
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Date
            </th>
            <th
              class="text-muted-foreground h-12 w-[150px] px-4 text-right align-middle text-sm font-medium"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading state -->
          <tr v-if="isLoading">
            <td
              colspan="6"
              class="h-24 text-center"
            >
              <Loader2
                class="text-muted-foreground mx-auto h-6 w-6 animate-spin"
              />
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-else-if="refunds.length === 0">
            <td
              colspan="6"
              class="text-muted-foreground h-24 text-center text-sm"
            >
              Aucune demande de remboursement
            </td>
          </tr>

          <!-- Refunds -->
          <tr
            v-else
            v-for="refund in refunds"
            :key="refund.id"
            class="hover:bg-muted/50 border-b transition-colors"
          >
            <td class="p-4">
              <div>
                <RouterLink
                  :to="`/admin/orders/${refund.id}`"
                  class="font-medium hover:underline"
                >
                  {{ refund.orderNumber }}
                </RouterLink>
                <p class="text-muted-foreground text-sm">
                  {{ refund.itemsCount }} article(s)
                </p>
              </div>
            </td>
            <td class="p-4">
              <div>
                <p class="font-medium">{{ refund.customer.name }}</p>
                <p class="text-muted-foreground text-sm">
                  {{ refund.customer.email }}
                </p>
              </div>
            </td>
            <td class="p-4 font-medium">
              {{ formatCurrency(refund.totalAmount) }}
            </td>
            <td class="p-4">
              <OrderStatusBadge :status="refund.status as OrderStatus" />
            </td>
            <td class="text-muted-foreground p-4 text-sm">
              {{ formatDate(refund.updatedAt) }}
            </td>
            <td class="p-4 text-right">
              <div
                v-if="refund.status === 'REFUND_REQUESTED'"
                class="flex items-center justify-end gap-2"
              >
                <Button
                  size="sm"
                  variant="outline"
                  class="text-green-600 hover:text-green-600"
                  @click="handleApprove(refund)"
                >
                  <CheckCircle class="mr-1 h-4 w-4" />
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  class="text-destructive hover:text-destructive"
                  @click="handleReject(refund)"
                >
                  <XCircle class="mr-1 h-4 w-4" />
                  Rejeter
                </Button>
              </div>
              <Badge
                v-else
                variant="outline"
              >
                Traité
              </Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Approve Dialog -->
    <Dialog v-model:open="showApproveDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer le remboursement</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d'approuver le remboursement de la commande
            <strong>{{ selectedRefund?.orderNumber }}</strong>
            pour un montant de
            <strong>
              {{ formatCurrency(selectedRefund?.totalAmount ?? 0) }}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showApproveDialog = false"
          >
            Annuler
          </Button>
          <Button
            :disabled="approveMutation.isPending.value"
            @click="confirmApprove"
          >
            <Loader2
              v-if="approveMutation.isPending.value"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Confirmer le remboursement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Reject Dialog -->
    <Dialog v-model:open="showRejectDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeter la demande</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de rejeter la demande de remboursement de la
            commande
            <strong>{{ selectedRefund?.orderNumber }}</strong>
            .
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-2">
          <label class="text-sm font-medium">Motif du rejet (optionnel)</label>
          <Textarea
            v-model="rejectReason"
            placeholder="Expliquez pourquoi la demande est rejetée..."
            rows="3"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showRejectDialog = false"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            :disabled="rejectMutation.isPending.value"
            @click="confirmReject"
          >
            <Loader2
              v-if="rejectMutation.isPending.value"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Rejeter la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
