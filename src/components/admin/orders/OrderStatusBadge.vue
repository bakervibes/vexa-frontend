<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types'

interface Props {
  status: OrderStatus
}

defineProps<Props>()

const statusConfig: Record<
  OrderStatus,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    class?: string
  }
> = {
  PENDING: {
    label: 'En attente',
    variant: 'outline',
    class: 'border-yellow-500 text-yellow-600',
  },
  PROCESSING: {
    label: 'En cours',
    variant: 'secondary',
    class: 'bg-blue-100 text-blue-700',
  },
  SHIPPED: {
    label: 'Expédié',
    variant: 'secondary',
    class: 'bg-purple-100 text-purple-700',
  },
  DELIVERED: {
    label: 'Livré',
    variant: 'default',
    class: 'bg-green-100 text-green-700',
  },
  CANCELLED: { label: 'Annulé', variant: 'destructive' },
  REFUND_REQUESTED: {
    label: 'Remboursement demandé',
    variant: 'outline',
    class: 'border-orange-500 text-orange-600',
  },
  REFUNDED: { label: 'Remboursé', variant: 'secondary' },
}
</script>

<template>
  <Badge
    :variant="statusConfig[status].variant"
    :class="statusConfig[status].class"
  >
    {{ statusConfig[status].label }}
  </Badge>
</template>
