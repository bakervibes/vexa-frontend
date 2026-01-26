<script setup lang="ts">
import { OrderStatusBadge } from '@/components/admin/orders'
import { AdminPageHeader } from '@/components/admin/shared'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ordersService } from '@/services/orders.service'
import { OrderStatus, type OrderDetails } from '@/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { ArrowLeft, Download } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const orderId = computed(() => route.params.id as string)

const { data: order, isLoading } = useQuery({
  queryKey: computed(() => ['orders', orderId.value]),
  queryFn: () => ordersService.getById(orderId.value),
  enabled: computed(() => !!orderId.value),
})

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: OrderStatus.PENDING, label: 'En attente' },
  { value: OrderStatus.PROCESSING, label: 'En cours' },
  { value: OrderStatus.SHIPPED, label: 'Expédié' },
  { value: OrderStatus.DELIVERED, label: 'Livré' },
  { value: OrderStatus.CANCELLED, label: 'Annulé' },
]

const selectedStatus = ref<OrderStatus | null>(null)

const updateStatusMutation = useMutation({
  mutationFn: (status: OrderStatus) =>
    ordersService.updateStatus(orderId.value, status),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    toast.success('Statut mis à jour')
  },
  onError: () => {
    toast.error('Erreur lors de la mise à jour')
  },
})

function handleStatusChange(status: unknown) {
  if (status && typeof status === 'string') {
    updateStatusMutation.mutate(status as OrderStatus)
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getCustomerName(user: OrderDetails['user']): string {
  return user.name || user.email
}

function getInitials(user: OrderDetails['user']): string {
  const name = user.name
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  return 'U'
}

async function downloadInvoice() {
  try {
    const blob = await ordersService.downloadInvoice(orderId.value)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `facture-${order.value?.orderNumber}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch {
    toast.error('Erreur lors du téléchargement')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        @click="router.push('/admin/orders')"
      >
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <AdminPageHeader
        :title="`Commande ${order?.orderNumber || ''}`"
        :description="order ? formatDate(order.createdAt) : 'Chargement...'"
      />
    </div>

    <div
      v-if="isLoading"
      class="flex h-64 items-center justify-center"
    >
      <svg
        class="text-muted-foreground h-8 w-8 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>

    <template v-else-if="order">
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Status Card -->
          <div class="bg-card rounded-xl border p-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 class="font-semibold">Statut</h3>
                <OrderStatusBadge :status="order.status" />
              </div>
              <div class="flex items-center gap-2">
                <Select
                  :model-value="order.status"
                  @update:model-value="handleStatusChange"
                >
                  <SelectTrigger class="w-[180px]">
                    <SelectValue placeholder="Changer le statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="option in statusOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="bg-card rounded-xl border p-6">
            <h3 class="mb-4 font-semibold">Articles commandés</h3>
            <div class="space-y-4">
              <div
                v-for="(item, index) in order.orderItems"
                :key="index"
                class="flex items-center gap-4 rounded-lg border p-4"
              >
                <div
                  class="bg-muted flex h-16 w-16 items-center justify-center rounded"
                >
                  <span class="text-2xl">📦</span>
                </div>
                <div class="flex-1">
                  <p class="font-medium">{{ item.name }}</p>
                  <p class="text-muted-foreground text-sm">
                    Quantité: {{ item.quantity }}
                  </p>
                  <p
                    v-if="item.options && item.options.length > 0"
                    class="text-muted-foreground text-sm"
                  >
                    <span
                      v-for="(opt, i) in item.options"
                      :key="i"
                    >
                      {{ opt.attribute }}: {{ opt.option }}
                      <span v-if="i < item.options.length - 1">,</span>
                    </span>
                  </p>
                </div>
                <p class="font-medium">
                  {{ formatCurrency(item.price * item.quantity) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Customer Info -->
          <div class="bg-card rounded-xl border p-6">
            <h3 class="mb-4 font-semibold">Client</h3>
            <div class="flex items-center gap-3">
              <Avatar class="h-10 w-10">
                <AvatarImage
                  v-if="order.user.image"
                  :src="order.user.image"
                />
                <AvatarFallback>{{ getInitials(order.user) }}</AvatarFallback>
              </Avatar>
              <div>
                <p class="font-medium">{{ getCustomerName(order.user) }}</p>
                <p class="text-muted-foreground text-sm">
                  {{ order.user.email }}
                </p>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div
            v-if="order.address"
            class="bg-card rounded-xl border p-6"
          >
            <h3 class="mb-4 font-semibold">Adresse de livraison</h3>
            <div class="text-sm">
              <p class="font-medium">{{ order.address.name }}</p>
              <p>{{ order.address.street }}</p>
              <p>{{ order.address.city }}, {{ order.address.country }}</p>
              <p class="text-muted-foreground mt-2">
                {{ order.address.phone }}
              </p>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="bg-card rounded-xl border p-6">
            <h3 class="mb-4 font-semibold">Récapitulatif</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Sous-total</span>
                <span>{{ formatCurrency(order.subtotalAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Livraison</span>
                <span>{{ formatCurrency(order.shippingCost) }}</span>
              </div>
              <div
                v-if="order.discountAmount > 0"
                class="flex justify-between text-green-600"
              >
                <span>Réduction</span>
                <span>-{{ formatCurrency(order.discountAmount) }}</span>
              </div>
              <div class="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>{{ formatCurrency(order.totalAmount) }}</span>
              </div>
            </div>
            <Button
              class="mt-4 w-full"
              variant="outline"
              @click="downloadInvoice"
            >
              <Download class="mr-2 h-4 w-4" />
              Télécharger la facture
            </Button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
