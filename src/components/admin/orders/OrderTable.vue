<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AdminOrder } from '@/types'
import { Eye, MoreHorizontal } from 'lucide-vue-next'
import OrderStatusBadge from './OrderStatusBadge.vue'

interface Props {
  orders: AdminOrder[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'view', order: AdminOrder): void
}>()

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

function getInitials(user: AdminOrder['user']): string {
  const name = user.name || user.email
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getCustomerName(user: AdminOrder['user']): string {
  return user.name || user.email
}
</script>

<template>
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
            Date
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Statut
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Total
          </th>
          <th
            class="text-muted-foreground h-12 w-[80px] px-4 text-right align-middle text-sm font-medium"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading state -->
        <tr v-if="loading">
          <td
            colspan="6"
            class="h-24 text-center"
          >
            <div class="flex items-center justify-center">
              <svg
                class="text-muted-foreground h-6 w-6 animate-spin"
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
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-else-if="orders.length === 0">
          <td
            colspan="6"
            class="text-muted-foreground h-24 text-center text-sm"
          >
            Aucune commande trouvée
          </td>
        </tr>

        <!-- Orders -->
        <tr
          v-else
          v-for="order in orders"
          :key="order.id"
          class="hover:bg-muted/50 cursor-pointer border-b transition-colors"
          @click="emit('view', order)"
        >
          <td class="p-4">
            <p class="font-medium">{{ order.orderNumber }}</p>
            <p class="text-muted-foreground text-sm">
              {{ order.itemsCount }} article(s)
            </p>
          </td>
          <td class="p-4">
            <div class="flex items-center gap-3">
              <Avatar class="h-8 w-8">
                <AvatarImage
                  v-if="order.user.image"
                  :src="order.user.image"
                />
                <AvatarFallback>{{ getInitials(order.user) }}</AvatarFallback>
              </Avatar>
              <div>
                <p class="text-sm font-medium">
                  {{ getCustomerName(order.user) }}
                </p>
                <p class="text-muted-foreground text-xs">
                  {{ order.user.email }}
                </p>
              </div>
            </div>
          </td>
          <td class="p-4">
            <p class="text-sm">{{ formatDate(order.createdAt) }}</p>
          </td>
          <td class="p-4">
            <OrderStatusBadge :status="order.status" />
          </td>
          <td class="p-4">
            <p class="font-medium">{{ formatCurrency(order.totalAmount) }}</p>
          </td>
          <td class="p-4 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                  @click.stop
                >
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click.stop="emit('view', order)">
                  <Eye class="mr-2 h-4 w-4" />
                  Voir détails
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
