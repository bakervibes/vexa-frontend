<script setup lang="ts">
import { StatCard } from '@/components/admin/shared'
import { useDashboardStats } from '@/composables/useAdmin'
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-vue-next'
import { computed } from 'vue'

const { stats, isLoading } = useDashboardStats()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}

const statCards = computed(() => {
  if (!stats.value) return []
  return [
    {
      title: 'Revenus du mois',
      value: formatCurrency(stats.value.revenue.month),
      description: `Total: ${formatCurrency(stats.value.revenue.total)}`,
      icon: DollarSign,
      trend: 'up' as const,
      trendValue: formatCurrency(stats.value.revenue.today) + " aujourd'hui",
    },
    {
      title: 'Commandes',
      value: formatNumber(stats.value.orders.total),
      description: `${stats.value.orders.pending} en attente`,
      icon: ShoppingCart,
      trend:
        stats.value.orders.pending > 0 ? ('neutral' as const) : ('up' as const),
      trendValue: `${stats.value.orders.delivered} livrées`,
    },
    {
      title: 'Clients',
      value: formatNumber(stats.value.customers.total),
      description: `${stats.value.customers.active} actifs ce mois`,
      icon: Users,
      trend: 'up' as const,
      trendValue: `+${stats.value.customers.newThisMonth} ce mois`,
    },
    {
      title: 'Produits',
      value: formatNumber(stats.value.products.total),
      description: `${stats.value.products.outOfStock} en rupture`,
      icon: Package,
      trend:
        stats.value.products.lowStock > 0 ? ('down' as const) : ('up' as const),
      trendValue: `${stats.value.products.lowStock} stock bas`,
    },
  ]
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <!-- Loading state -->
    <template v-if="isLoading">
      <div
        v-for="i in 4"
        :key="i"
        class="bg-muted h-32 animate-pulse rounded-xl border"
      />
    </template>

    <!-- Stats cards -->
    <template v-else>
      <StatCard
        v-for="stat in statCards"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :description="stat.description"
        :icon="stat.icon"
        :trend="stat.trend"
        :trend-value="stat.trendValue"
      />
    </template>
  </div>
</template>
