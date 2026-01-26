<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { useLowStockProducts } from '@/composables/useAdmin'
import { AlertTriangle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const { lowStockProducts, isLoading } = useLowStockProducts(10)

function goToProduct(slug: string) {
  router.push(`/admin/products/${slug}/edit`)
}
</script>

<template>
  <div class="bg-card rounded-xl border p-6">
    <div class="flex items-center gap-2">
      <AlertTriangle class="h-5 w-5 text-orange-500" />
      <h3 class="text-lg font-semibold">Stock bas</h3>
    </div>

    <div class="mt-4 space-y-3">
      <div
        v-if="isLoading"
        class="flex h-32 items-center justify-center"
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
        v-else-if="lowStockProducts.length === 0"
        class="py-8 text-center"
      >
        <p class="text-muted-foreground text-sm">Tous les stocks sont OK</p>
      </div>

      <div
        v-else
        v-for="product in lowStockProducts.slice(0, 5)"
        :key="product.id"
        class="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors"
        @click="goToProduct(product.slug)"
      >
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
          <p class="text-muted-foreground text-xs">{{ product.category }}</p>
        </div>
        <Badge
          :variant="product.stock === 0 ? 'destructive' : 'outline'"
          class="shrink-0"
        >
          {{ product.stock }} en stock
        </Badge>
      </div>

      <router-link
        v-if="lowStockProducts.length > 5"
        to="/admin/products?lowStock=true"
        class="text-primary block text-center text-sm hover:underline"
      >
        Voir {{ lowStockProducts.length - 5 }} autres produits
      </router-link>
    </div>
  </div>
</template>
