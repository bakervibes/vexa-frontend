<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRevenueData } from '@/composables/useAdmin'
import type { RevenuePeriod } from '@/types'
import { computed, ref } from 'vue'

const period = ref<RevenuePeriod>('month')
const { revenueData, isLoading } = useRevenueData(period)

const periods: { value: RevenuePeriod; label: string }[] = [
  { value: 'week', label: '7 jours' },
  { value: 'month', label: '30 jours' },
  { value: 'year', label: '12 mois' },
]

const data = computed(() =>
  Array.isArray(revenueData.value) ? revenueData.value : [],
)

const maxRevenue = computed(() => {
  if (!data.value.length) return 1
  return Math.max(...data.value.map((d) => d.revenue))
})

const totalRevenue = computed(() => {
  return data.value.reduce((sum, d) => sum + d.revenue, 0)
})

const totalOrders = computed(() => {
  return data.value.reduce((sum, d) => sum + d.orders, 0)
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (period.value === 'year') {
    return date.toLocaleDateString('fr-FR', { month: 'short' })
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="bg-card rounded-xl border p-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Revenus</h3>
        <p class="text-muted-foreground text-sm">
          {{ formatCurrency(totalRevenue) }} · {{ totalOrders }} commandes
        </p>
      </div>
      <div class="flex gap-1">
        <Button
          v-for="p in periods"
          :key="p.value"
          :variant="period === p.value ? 'default' : 'outline'"
          size="sm"
          @click="period = p.value"
        >
          {{ p.label }}
        </Button>
      </div>
    </div>

    <!-- Chart -->
    <div class="mt-6">
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
        v-else-if="data.length === 0"
        class="flex h-48 items-center justify-center"
      >
        <p class="text-muted-foreground text-sm">Aucune donnée disponible</p>
      </div>

      <div
        v-else
        class="flex h-48 items-end gap-1"
      >
        <div
          v-for="(item, index) in data"
          :key="index"
          class="group relative flex-1"
        >
          <!-- Bar -->
          <div
            class="bg-primary hover:bg-primary/80 w-full rounded-t transition-all"
            :style="{
              height: `${(item.revenue / maxRevenue) * 100}%`,
              minHeight: item.revenue > 0 ? '4px' : '0',
            }"
          />
          <!-- Tooltip -->
          <div
            class="bg-popover pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded px-2 py-1 text-xs shadow-lg group-hover:block"
          >
            <p class="font-medium">{{ formatCurrency(item.revenue) }}</p>
            <p class="text-muted-foreground">{{ item.orders }} commandes</p>
            <p class="text-muted-foreground">{{ formatDate(item.date) }}</p>
          </div>
        </div>
      </div>

      <!-- X-axis labels -->
      <div
        v-if="data.length > 0"
        class="text-muted-foreground mt-2 flex justify-between text-xs"
      >
        <span>{{ formatDate(data[0]?.date) }}</span>
        <span>{{ formatDate(data[data.length - 1]?.date) }}</span>
      </div>
    </div>
  </div>
</template>
