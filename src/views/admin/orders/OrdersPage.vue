<script setup lang="ts">
import { OrderTable } from '@/components/admin/orders'
import { AdminPageHeader } from '@/components/admin/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminOrders } from '@/composables/useAdmin'
import { OrderStatus, type AdminOrder } from '@/types'
import { ChevronLeft, ChevronRight, Search } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const {
  orders,
  pagination,
  filters,
  isLoading,
  setPage,
  setStatus,
  setSearch,
  resetFilters,
} = useAdminOrders()

const searchQuery = ref('')
const selectedStatus = ref<OrderStatus | 'all'>('all')

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous les statuts' },
  { value: OrderStatus.PENDING, label: 'En attente' },
  { value: OrderStatus.PROCESSING, label: 'En cours' },
  { value: OrderStatus.SHIPPED, label: 'Expédié' },
  { value: OrderStatus.DELIVERED, label: 'Livré' },
  { value: OrderStatus.CANCELLED, label: 'Annulé' },
  { value: OrderStatus.REFUND_REQUESTED, label: 'Remboursement demandé' },
  { value: OrderStatus.REFUNDED, label: 'Remboursé' },
]

watch(selectedStatus, (status) => {
  setStatus(status === 'all' ? undefined : status)
})

let searchTimeout: number
watch(searchQuery, (query) => {
  clearTimeout(searchTimeout)
  searchTimeout = window.setTimeout(() => {
    setSearch(query || undefined)
  }, 300)
})

function handleView(order: AdminOrder) {
  router.push(`/admin/orders/${order.id}`)
}

function handleReset() {
  searchQuery.value = ''
  selectedStatus.value = 'all'
  resetFilters()
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Commandes"
      description="Gérez toutes les commandes"
    />

    <!-- Filters -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div class="relative max-w-sm flex-1">
        <Search
          class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <Input
          v-model="searchQuery"
          placeholder="Rechercher par n° ou client..."
          class="pl-9"
        />
      </div>
      <Select v-model="selectedStatus">
        <SelectTrigger class="w-[200px]">
          <SelectValue placeholder="Statut" />
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
      <Button
        variant="outline"
        @click="handleReset"
      >
        Réinitialiser
      </Button>
    </div>

    <!-- Orders Table -->
    <OrderTable
      :orders="orders"
      :loading="isLoading"
      @view="handleView"
    />

    <!-- Pagination -->
    <div
      v-if="pagination && pagination.totalPages > 1"
      class="flex items-center justify-between"
    >
      <p class="text-muted-foreground text-sm">
        Page {{ pagination.page }} sur {{ pagination.totalPages }} ({{
          pagination.total
        }}
        commandes)
      </p>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page <= 1"
          @click="setPage(pagination.page - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pagination.page >= pagination.totalPages"
          @click="setPage(pagination.page + 1)"
        >
          Suivant
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
