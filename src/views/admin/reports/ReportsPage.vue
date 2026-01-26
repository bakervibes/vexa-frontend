<script setup lang="ts">
import { AdminPageHeader, StatCard } from '@/components/admin/shared'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useDashboardStats,
  useRevenueData,
  useTopProducts,
} from '@/composables/useAdmin'
import type { RevenuePeriod } from '@/types/admin'
import {
  CheckCircle,
  DollarSign,
  Download,
  Package,
  ShoppingCart,
  TrendingUp,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const selectedPeriod = ref<RevenuePeriod>('month')

const { stats, isLoading: isLoadingStats } = useDashboardStats()
const { revenueData, isLoading: isLoadingRevenue } =
  useRevenueData(selectedPeriod)
const { topProducts, isLoading: isLoadingProducts } = useTopProducts(10)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (selectedPeriod.value === 'year') {
    return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const totalRevenue = computed(() => {
  return revenueData.value.reduce((sum, d) => sum + d.revenue, 0)
})

const totalOrders = computed(() => {
  return revenueData.value.reduce((sum, d) => sum + d.orders, 0)
})

const avgOrderValue = computed(() => {
  if (totalOrders.value === 0) return 0
  return totalRevenue.value / totalOrders.value
})

const totalProductsSold = computed(() => {
  return topProducts.value.reduce((sum, p) => sum + p.totalSold, 0)
})

// Conversion rate: delivered orders / total non-cancelled orders
const conversionRate = computed(() => {
  if (!stats.value) return 0
  const { orders } = stats.value
  const completedOrders = orders.delivered
  const totalValidOrders = orders.total - orders.cancelled
  if (totalValidOrders === 0) return 0
  return Math.round((completedOrders / totalValidOrders) * 100)
})

const periodLabel = computed(() => {
  const labels: Record<RevenuePeriod, string> = {
    week: 'Cette semaine',
    month: 'Ce mois',
    year: 'Cette année',
  }
  return labels[selectedPeriod.value]
})

// Maximum revenue for chart scaling
const maxRevenue = computed(() => {
  if (revenueData.value.length === 0) return 0
  return Math.max(...revenueData.value.map((d) => d.revenue))
})

function getBarHeight(revenue: number): number {
  if (maxRevenue.value === 0) return 0
  return Math.round((revenue / maxRevenue.value) * 100)
}

// Export functions
function exportRevenueCSV() {
  if (revenueData.value.length === 0) {
    toast.error('Aucune donnée à exporter')
    return
  }

  const headers = ['Date', 'Revenus (XOF)', 'Commandes']
  const rows = revenueData.value.map((d) => [d.date, d.revenue, d.orders])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  downloadCSV(
    csvContent,
    `revenus-${selectedPeriod.value}-${new Date().toISOString().slice(0, 10)}.csv`,
  )
  toast.success('Export CSV téléchargé')
}

function exportProductsCSV() {
  if (topProducts.value.length === 0) {
    toast.error('Aucune donnée à exporter')
    return
  }

  const headers = ['Rang', 'Produit', 'Quantité vendue', 'Revenus (XOF)']
  const rows = topProducts.value.map((p, i) => [
    i + 1,
    `"${p.name.replace(/"/g, '""')}"`,
    p.totalSold,
    p.revenue,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  downloadCSV(
    csvContent,
    `top-produits-${new Date().toISOString().slice(0, 10)}.csv`,
  )
  toast.success('Export CSV téléchargé')
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

function setPeriod(period: unknown) {
  selectedPeriod.value = period as RevenuePeriod
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-start justify-between">
      <AdminPageHeader
        title="Rapports"
        description="Analysez les performances de votre boutique"
      />
      <Select
        :model-value="selectedPeriod"
        @update:model-value="setPeriod"
      >
        <SelectTrigger class="w-40">
          <SelectValue placeholder="Période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">7 derniers jours</SelectItem>
          <SelectItem value="month">30 derniers jours</SelectItem>
          <SelectItem value="year">Cette année</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Summary Stats -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        :title="`Revenus - ${periodLabel}`"
        :value="formatCurrency(totalRevenue)"
        :icon="DollarSign"
        trend="up"
        :trend-value="`${totalOrders} commandes`"
        :loading="isLoadingRevenue"
      />
      <StatCard
        title="Panier moyen"
        :value="formatCurrency(avgOrderValue)"
        :icon="ShoppingCart"
        trend="neutral"
        :loading="isLoadingRevenue"
      />
      <StatCard
        title="Produits vendus"
        :value="totalProductsSold.toString()"
        :icon="Package"
        trend="up"
        :loading="isLoadingProducts"
      />
      <StatCard
        title="Taux de livraison"
        :value="`${conversionRate}%`"
        description="Commandes livrées / Total"
        :icon="CheckCircle"
        :trend="
          conversionRate >= 70
            ? 'up'
            : conversionRate >= 50
              ? 'neutral'
              : 'down'
        "
        :loading="isLoadingStats"
      />
    </div>

    <!-- Revenue Chart -->
    <div class="bg-card rounded-xl border p-6">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold">Évolution des revenus</h3>
        <Button
          variant="outline"
          size="sm"
          @click="exportRevenueCSV"
        >
          <Download class="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div
        v-if="isLoadingRevenue"
        class="flex h-64 items-center justify-center"
      >
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

      <div
        v-else-if="revenueData.length === 0"
        class="flex h-64 items-center justify-center"
      >
        <p class="text-muted-foreground">Aucune donnée pour cette période</p>
      </div>

      <div
        v-else
        class="h-64"
      >
        <!-- Simple bar chart -->
        <div class="flex h-full items-end gap-1">
          <div
            v-for="data in revenueData"
            :key="data.date"
            class="group relative flex flex-1 flex-col items-center"
          >
            <!-- Bar -->
            <div
              class="bg-primary hover:bg-primary/80 w-full rounded-t transition-all"
              :style="{
                height: `${getBarHeight(data.revenue)}%`,
                minHeight: data.revenue > 0 ? '4px' : '0',
              }"
            />
            <!-- Tooltip -->
            <div
              class="bg-popover absolute bottom-full mb-2 hidden rounded px-2 py-1 text-xs shadow-lg group-hover:block"
            >
              <p class="font-medium">{{ formatCurrency(data.revenue) }}</p>
              <p class="text-muted-foreground">{{ data.orders }} cmd</p>
            </div>
            <!-- Label -->
            <span
              class="text-muted-foreground mt-2 text-[10px]"
              :class="{ 'hidden sm:block': revenueData.length > 15 }"
            >
              {{ formatDate(data.date) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Two column layout -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Top Products -->
      <div class="bg-card rounded-xl border p-6">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold">Meilleures ventes</h3>
          <Button
            variant="outline"
            size="sm"
            @click="exportProductsCSV"
          >
            <Download class="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div
          v-if="isLoadingProducts"
          class="flex h-48 items-center justify-center"
        >
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

        <div
          v-else-if="topProducts.length === 0"
          class="flex h-48 items-center justify-center"
        >
          <p class="text-muted-foreground">Aucune vente enregistrée</p>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="(product, index) in topProducts.slice(0, 5)"
            :key="product.id"
            class="flex items-center gap-3"
          >
            <span
              class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium"
              :class="{
                'bg-yellow-100 text-yellow-700': index === 0,
                'bg-gray-100 text-gray-700': index === 1,
                'bg-orange-100 text-orange-700': index === 2,
                'bg-muted text-muted-foreground': index > 2,
              }"
            >
              {{ index + 1 }}
            </span>
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="h-10 w-10 rounded object-cover"
            />
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ product.name }}</p>
              <p class="text-muted-foreground text-sm">
                {{ product.totalSold }} vendus
              </p>
            </div>
            <span class="font-medium">
              {{ formatCurrency(product.revenue) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Orders Summary -->
      <div class="bg-card rounded-xl border p-6">
        <h3 class="mb-4 text-lg font-semibold">Répartition des commandes</h3>

        <div
          v-if="isLoadingStats"
          class="flex h-48 items-center justify-center"
        >
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

        <div
          v-else-if="stats"
          class="space-y-4"
        >
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Total commandes</span>
            <span class="text-2xl font-bold">{{ stats.orders.total }}</span>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full bg-yellow-500" />
                <span>En attente</span>
              </div>
              <span class="font-medium">{{ stats.orders.pending }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full bg-blue-500" />
                <span>En cours</span>
              </div>
              <span class="font-medium">{{ stats.orders.processing }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full bg-purple-500" />
                <span>Expédiées</span>
              </div>
              <span class="font-medium">{{ stats.orders.shipped }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full bg-green-500" />
                <span>Livrées</span>
              </div>
              <span class="font-medium">{{ stats.orders.delivered }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <span class="h-3 w-3 rounded-full bg-red-500" />
                <span>Annulées</span>
              </div>
              <span class="font-medium">{{ stats.orders.cancelled }}</span>
            </div>
          </div>

          <!-- Visual bar -->
          <div class="bg-muted mt-4 flex h-4 overflow-hidden rounded-full">
            <div
              v-if="stats.orders.pending > 0"
              class="bg-yellow-500"
              :style="{
                width: `${(stats.orders.pending / stats.orders.total) * 100}%`,
              }"
            />
            <div
              v-if="stats.orders.processing > 0"
              class="bg-blue-500"
              :style="{
                width: `${(stats.orders.processing / stats.orders.total) * 100}%`,
              }"
            />
            <div
              v-if="stats.orders.shipped > 0"
              class="bg-purple-500"
              :style="{
                width: `${(stats.orders.shipped / stats.orders.total) * 100}%`,
              }"
            />
            <div
              v-if="stats.orders.delivered > 0"
              class="bg-green-500"
              :style="{
                width: `${(stats.orders.delivered / stats.orders.total) * 100}%`,
              }"
            />
            <div
              v-if="stats.orders.cancelled > 0"
              class="bg-red-500"
              :style="{
                width: `${(stats.orders.cancelled / stats.orders.total) * 100}%`,
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Full Top Products Table -->
    <div class="bg-card rounded-xl border p-6">
      <h3 class="mb-4 text-lg font-semibold">
        Classement complet des produits
      </h3>

      <div
        v-if="isLoadingProducts"
        class="flex h-48 items-center justify-center"
      >
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

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th
                class="text-muted-foreground pb-3 text-left text-sm font-medium"
              >
                #
              </th>
              <th
                class="text-muted-foreground pb-3 text-left text-sm font-medium"
              >
                Produit
              </th>
              <th
                class="text-muted-foreground pb-3 text-right text-sm font-medium"
              >
                Vendus
              </th>
              <th
                class="text-muted-foreground pb-3 text-right text-sm font-medium"
              >
                Revenus
              </th>
              <th
                class="text-muted-foreground pb-3 text-right text-sm font-medium"
              >
                % du total
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(product, index) in topProducts"
              :key="product.id"
              class="border-b last:border-0"
            >
              <td class="py-3 text-sm">{{ index + 1 }}</td>
              <td class="py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="product.image"
                    :src="product.image"
                    :alt="product.name"
                    class="h-10 w-10 rounded object-cover"
                  />
                  <span class="font-medium">{{ product.name }}</span>
                </div>
              </td>
              <td class="py-3 text-right text-sm">{{ product.totalSold }}</td>
              <td class="py-3 text-right font-medium">
                {{ formatCurrency(product.revenue) }}
              </td>
              <td class="text-muted-foreground py-3 text-right text-sm">
                {{
                  totalProductsSold > 0
                    ? Math.round((product.totalSold / totalProductsSold) * 100)
                    : 0
                }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
