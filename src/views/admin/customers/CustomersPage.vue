<script setup lang="ts">
import { AdminPageHeader } from '@/components/admin/shared'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAdminCustomers } from '@/composables/useAdmin'
import { ChevronLeft, ChevronRight, Search } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { customers, pagination, isLoading, setPage } = useAdminCustomers()

const searchQuery = ref('')

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
  })
}

function getCustomerName(customer: { name: string; email: string }): string {
  return customer.name || customer.email
}

function getInitials(customer: { name: string; email: string }): string {
  return getCustomerName(customer).slice(0, 2).toUpperCase()
}

function handleView(customerId: string) {
  router.push(`/admin/customers/${customerId}`)
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Clients"
      description="Gérez vos clients"
    />

    <!-- Search -->
    <div class="flex items-center gap-4">
      <div class="relative max-w-sm flex-1">
        <Search
          class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <Input
          v-model="searchQuery"
          placeholder="Rechercher un client..."
          class="pl-9"
        />
      </div>
    </div>

    <!-- Customers Table -->
    <div class="rounded-md border">
      <table class="w-full">
        <thead>
          <tr class="bg-muted/50 border-b">
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Client
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Inscription
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Commandes
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Total dépensé
            </th>
            <th
              class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
            >
              Statut
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td
              colspan="5"
              class="h-24 text-center"
            >
              <svg
                class="text-muted-foreground mx-auto h-6 w-6 animate-spin"
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
            </td>
          </tr>
          <tr v-else-if="customers.length === 0">
            <td
              colspan="5"
              class="text-muted-foreground h-24 text-center text-sm"
            >
              Aucun client trouvé
            </td>
          </tr>
          <tr
            v-else
            v-for="customer in customers"
            :key="customer.id"
            class="hover:bg-muted/50 cursor-pointer border-b transition-colors"
            @click="handleView(customer.id)"
          >
            <td class="p-4">
              <div class="flex items-center gap-3">
                <Avatar class="h-9 w-9">
                  <AvatarImage
                    v-if="customer.image"
                    :src="customer.image"
                  />
                  <AvatarFallback>{{ getInitials(customer) }}</AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-medium">{{ getCustomerName(customer) }}</p>
                  <p class="text-muted-foreground text-sm">
                    {{ customer.email }}
                  </p>
                </div>
              </div>
            </td>
            <td class="p-4 text-sm">{{ formatDate(customer.createdAt) }}</td>
            <td class="p-4">
              <Badge variant="secondary">
                {{ customer.ordersCount }} commande(s)
              </Badge>
            </td>
            <td class="p-4 font-medium">
              {{ formatCurrency(customer.totalSpent) }}
            </td>
            <td class="p-4">
              <Badge :variant="customer.isActive ? 'default' : 'destructive'">
                {{ customer.isActive ? 'Actif' : 'Inactif' }}
              </Badge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination && pagination.totalPages > 1"
      class="flex items-center justify-between"
    >
      <p class="text-muted-foreground text-sm">
        Page {{ pagination.page }} sur {{ pagination.totalPages }} ({{
          pagination.total
        }}
        clients)
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
