<script setup lang="ts">
import { useTopProducts } from '@/composables/useAdmin'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { topProducts, isLoading } = useTopProducts(5)

const maxSold = computed(() => {
  if (!topProducts.value.length) return 1
  return Math.max(...topProducts.value.map((p) => p.totalSold))
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value)
}

function goToProduct(slug: string) {
  router.push(`/admin/products/${slug}/edit`)
}
</script>

<template>
  <div class="bg-card rounded-xl border p-6">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Meilleures ventes</h3>
      <router-link
        to="/admin/reports"
        class="text-primary text-sm hover:underline"
      >
        Voir rapport
      </router-link>
    </div>

    <div class="mt-4 space-y-4">
      <div
        v-if="isLoading"
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
        class="text-muted-foreground py-8 text-center text-sm"
      >
        Aucune vente enregistrée
      </div>

      <div
        v-else
        v-for="(product, index) in topProducts"
        :key="product.id"
        class="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors"
        @click="goToProduct(product.slug)"
      >
        <span
          class="bg-muted flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium"
        >
          {{ index + 1 }}
        </span>
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="h-10 w-10 rounded object-cover"
        />
        <div
          v-else
          class="bg-muted flex h-10 w-10 items-center justify-center rounded"
        >
          <span class="text-muted-foreground text-xs">N/A</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ product.name }}</p>
          <div class="mt-1 flex items-center gap-2">
            <div class="bg-muted h-1.5 flex-1 rounded-full">
              <div
                class="bg-primary h-full rounded-full"
                :style="{ width: `${(product.totalSold / maxSold) * 100}%` }"
              />
            </div>
            <span class="text-muted-foreground text-xs">
              {{ product.totalSold }} vendus
            </span>
          </div>
        </div>
        <p class="text-sm font-medium">{{ formatCurrency(product.revenue) }}</p>
      </div>
    </div>
  </div>
</template>
