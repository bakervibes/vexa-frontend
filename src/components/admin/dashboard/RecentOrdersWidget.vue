<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useRecentOrders } from '@/composables/useAdmin'
import type { OrderStatus } from '@/types'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { recentOrders, isLoading } = useRecentOrders(5)

const statusConfig: Record<
  OrderStatus,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
> = {
  PENDING: { label: 'En attente', variant: 'outline' },
  PROCESSING: { label: 'En cours', variant: 'secondary' },
  SHIPPED: { label: 'Expédié', variant: 'default' },
  DELIVERED: { label: 'Livré', variant: 'default' },
  CANCELLED: { label: 'Annulé', variant: 'destructive' },
  REFUND_REQUESTED: { label: 'Remboursement', variant: 'outline' },
  REFUNDED: { label: 'Remboursé', variant: 'secondary' },
}

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
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function goToOrder(id: string) {
  router.push(`/admin/orders/${id}`)
}
</script>

<template>
  <div class="bg-card rounded-xl border p-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Commandes récentes</h3>
      <router-link
        to="/admin/orders"
        class="text-primary text-sm hover:underline"
      >
        Voir tout
      </router-link>
    </div>

    <div class="mt-4 space-y-4">
      <div
        v-if="isLoading"
        class="flex h-48 items-center justify-center"
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

      <div
        v-else-if="recentOrders.length === 0"
        class="text-muted-foreground py-8 text-center text-sm"
      >
        Aucune commande récente
      </div>

      <div
        v-else
        v-for="order in recentOrders"
        :key="order.id"
        class="hover:bg-muted/50 flex cursor-pointer items-center justify-between gap-4 rounded-lg p-2 transition-colors"
        @click="goToOrder(order.id)"
      >
        <div class="flex items-center gap-3">
          <Avatar class="h-9 w-9">
            <AvatarImage
              v-if="order.customer.image"
              :src="order.customer.image"
            />
            <AvatarFallback>
              {{ getInitials(order.customer.name) }}
            </AvatarFallback>
          </Avatar>
          <div>
            <p class="text-sm font-medium">{{ order.customer.name }}</p>
            <p class="text-muted-foreground text-xs">{{ order.orderNumber }}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-medium">
            {{ formatCurrency(order.totalAmount) }}
          </p>
          <Badge
            :variant="statusConfig[order.status].variant"
            class="text-xs"
          >
            {{ statusConfig[order.status].label }}
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>
