<script setup lang="ts">
import { OrderStatusBadge } from '@/components/admin/orders'
import { AdminPageHeader } from '@/components/admin/shared'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  adminService,
  type CustomerDetailResponse,
} from '@/services/admin.service'
import type { OrderStatus } from '@/types'
import { useQuery } from '@tanstack/vue-query'
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Star,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const customerId = computed(() => route.params.id as string)

const { data, isLoading, isError } = useQuery({
  queryKey: computed(() => ['admin', 'customer', customerId.value]),
  queryFn: () => adminService.getCustomerDetail(customerId.value),
  staleTime: 1000 * 60 * 2,
})

const customer = computed(() => data.value?.customer)
const stats = computed(() => data.value?.stats)
const addresses = computed(() => data.value?.addresses || [])
const orders = computed(() => data.value?.orders || [])

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value)
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        @click="router.push('/admin/customers')"
      >
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <AdminPageHeader
        title="Détail du client"
        :description="customer?.email || ''"
      />
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="grid gap-6 lg:grid-cols-3"
    >
      <div class="bg-card rounded-xl border p-6">
        <div class="flex flex-col items-center">
          <Skeleton class="h-20 w-20 rounded-full" />
          <Skeleton class="mt-4 h-6 w-32" />
          <Skeleton class="mt-2 h-4 w-40" />
        </div>
      </div>
      <div class="space-y-6 lg:col-span-2">
        <div class="grid gap-4 sm:grid-cols-3">
          <Skeleton class="h-24 rounded-xl" />
          <Skeleton class="h-24 rounded-xl" />
          <Skeleton class="h-24 rounded-xl" />
        </div>
        <Skeleton class="h-64 rounded-xl" />
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="isError"
      class="bg-card text-muted-foreground rounded-xl border p-8 text-center"
    >
      Une erreur est survenue lors du chargement des détails du client.
    </div>

    <!-- Content -->
    <div
      v-else-if="customer"
      class="grid gap-6 lg:grid-cols-3"
    >
      <!-- Customer Info -->
      <div class="space-y-6">
        <div class="bg-card rounded-xl border p-6">
          <div class="flex flex-col items-center text-center">
            <Avatar class="h-20 w-20">
              <AvatarImage :src="customer.image ?? ''" />
              <AvatarFallback class="text-xl">
                {{ getInitials(customer.name) }}
              </AvatarFallback>
            </Avatar>
            <h3 class="mt-4 text-lg font-semibold">{{ customer.name }}</h3>
            <p class="text-muted-foreground text-sm">
              Membre depuis {{ formatDate(customer.createdAt) }}
            </p>
            <Badge
              class="mt-2"
              :variant="customer.isActive ? 'default' : 'secondary'"
            >
              {{ customer.isActive ? 'Actif' : 'Inactif' }}
            </Badge>
          </div>
          <div class="mt-6 space-y-3">
            <div class="flex items-center gap-3 text-sm">
              <Mail class="text-muted-foreground h-4 w-4" />
              <span>{{ customer.email }}</span>
            </div>
            <div
              v-if="customer.phone"
              class="flex items-center gap-3 text-sm"
            >
              <Phone class="text-muted-foreground h-4 w-4" />
              <span>{{ customer.phone }}</span>
            </div>
          </div>
        </div>

        <!-- Addresses -->
        <div
          v-if="addresses.length > 0"
          class="bg-card rounded-xl border p-6"
        >
          <h3 class="font-semibold">Adresses</h3>
          <div class="mt-4 space-y-3">
            <div
              v-for="address in addresses"
              :key="address.id"
              class="rounded-lg border p-3"
            >
              <div class="flex items-start gap-2">
                <MapPin class="text-muted-foreground mt-0.5 h-4 w-4" />
                <div class="text-sm">
                  <p class="font-medium">{{ address.name }}</p>
                  <p class="text-muted-foreground">{{ address.street }}</p>
                  <p class="text-muted-foreground">
                    {{ address.city }}, {{ address.country }}
                  </p>
                  <p
                    v-if="address.phone"
                    class="text-muted-foreground"
                  >
                    {{ address.phone }}
                  </p>
                </div>
              </div>
              <Badge
                v-if="address.isDefault"
                variant="outline"
                class="mt-2"
              >
                Par défaut
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats & Orders -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Stats -->
        <div class="grid gap-4 sm:grid-cols-4">
          <div class="bg-card rounded-xl border p-4">
            <div class="flex items-center gap-2">
              <ShoppingBag class="text-muted-foreground h-4 w-4" />
              <p class="text-muted-foreground text-sm">Commandes</p>
            </div>
            <p class="mt-2 text-2xl font-bold">{{ stats?.totalOrders || 0 }}</p>
          </div>
          <div class="bg-card rounded-xl border p-4">
            <p class="text-muted-foreground text-sm">Total dépensé</p>
            <p class="mt-2 text-2xl font-bold">
              {{ formatCurrency(stats?.totalSpent || 0) }}
            </p>
          </div>
          <div class="bg-card rounded-xl border p-4">
            <p class="text-muted-foreground text-sm">Panier moyen</p>
            <p class="mt-2 text-2xl font-bold">
              {{ formatCurrency(stats?.averageOrderValue || 0) }}
            </p>
          </div>
          <div class="bg-card rounded-xl border p-4">
            <div class="flex items-center gap-2">
              <Star class="text-muted-foreground h-4 w-4" />
              <p class="text-muted-foreground text-sm">Avis</p>
            </div>
            <p class="mt-2 text-2xl font-bold">
              {{ stats?.totalReviews || 0 }}
            </p>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="bg-card rounded-xl border">
          <div class="border-b p-4">
            <h3 class="font-semibold">Commandes récentes</h3>
          </div>
          <div
            v-if="orders.length === 0"
            class="text-muted-foreground p-8 text-center text-sm"
          >
            Aucune commande
          </div>
          <div
            v-else
            class="divide-y"
          >
            <div
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-muted/50 flex items-center justify-between p-4 transition-colors"
            >
              <div>
                <RouterLink
                  :to="`/admin/orders/${order.id}`"
                  class="font-medium hover:underline"
                >
                  {{ order.orderNumber }}
                </RouterLink>
                <p class="text-muted-foreground text-sm">
                  {{ formatDate(order.createdAt) }} - {{ order.itemsCount }}
                  article(s)
                </p>
              </div>
              <div class="flex items-center gap-4">
                <span class="font-medium">
                  {{ formatCurrency(order.totalAmount) }}
                </span>
                <OrderStatusBadge :status="order.status as OrderStatus" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
