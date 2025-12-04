<script setup lang="ts">
import { useProducts } from '@/composables/useProducts'
import { SlidersHorizontalIcon } from 'lucide-vue-next'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import Paginator from 'primevue/paginator'
import { computed, ref } from 'vue'
import ProductCard from '../common/ProductCard.vue'
import ProductCardSkeleton from '../common/ProductCardSkeleton.vue'
import ShopFilter from './ShopFilter.vue'
import ShopSort from './ShopSort.vue'

const { products, paginationProducts, filters, setFilters, isLoadingProducts } =
  useProducts()

const currentPage = computed(() => Number(filters.value.page) || 1)
const isFilterDrawerOpen = ref(false)

const onPageChange = (event: { page: number }) => {
  setFilters({ page: String(event.page + 1) }, false)
}
</script>

<template>
  <section class="flex flex-1 flex-col gap-4">
    <div class="flex items-center justify-between gap-2">
      <Button
        outlined
        class="flex !h-11 items-center gap-2 lg:hidden"
        @click="isFilterDrawerOpen = true"
      >
        <h1 class="text-xl font-bold">Filter</h1>
        <SlidersHorizontalIcon class="size-6 text-black/40" />
      </Button>

      <Drawer
        v-model:visible="isFilterDrawerOpen"
        position="left"
        :style="{ width: '25rem' }"
        class="block lg:hidden"
      >
        <template #header>
          <div>
            <h1 class="text-2xl font-bold">Filter</h1>
            <p class="text-sm text-gray-500">
              Use the available filters to refine your product search.
            </p>
          </div>
        </template>

        <div class="h-full overflow-y-auto">
          <ShopFilter />
        </div>
      </Drawer>

      <h1>{{ paginationProducts?.total || 0 }} products</h1>

      <!-- Sort by -->
      <ShopSort />
    </div>

    <!-- Loading state -->
    <div
      v-if="isLoadingProducts"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
    >
      <ProductCardSkeleton
        v-for="i in 9"
        :key="i"
      />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="products.length === 0"
      class="flex flex-1 items-center justify-center py-12"
    >
      <div class="flex flex-col items-center gap-3 text-center">
        <div class="rounded-full bg-gray-100 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p class="text-lg font-medium text-gray-700">Aucun produit trouvé</p>
        <p class="text-sm text-gray-500">
          Essayez de modifier vos filtres pour trouver ce que vous cherchez.
        </p>
      </div>
    </div>

    <!-- Products grid -->
    <div
      v-else
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
    >
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

    <Paginator
      v-if="paginationProducts && paginationProducts.totalPages > 1"
      :rows="21"
      :totalRecords="paginationProducts.total"
      :first="(currentPage - 1) * 21"
      @page="onPageChange"
      template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
    />
  </section>
</template>

<style scoped></style>
