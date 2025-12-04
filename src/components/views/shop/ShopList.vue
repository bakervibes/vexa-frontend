<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useProducts } from '@/composables/useProducts'
import { SlidersHorizontalIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import ProductCard from '../common/ProductCard.vue'
import ProductCardSkeleton from '../common/ProductCardSkeleton.vue'
import ShopFilter from './ShopFilter.vue'
import ShopSort from './ShopSort.vue'

const { products, paginationProducts, filters, setFilters, isLoadingProducts } =
  useProducts()

const currentPage = computed(() => Number(filters.value.page) || 1)
</script>

<template>
  <section class="flex flex-1 flex-col gap-4">
    <div class="flex items-center justify-between gap-2">
      <Sheet>
        <SheetTrigger class="flex items-center justify-between gap-3 lg:hidden">
          <Button
            variant="outline"
            class="flex h-11! items-center gap-2"
          >
            <h1 class="text-xl font-bold">Filter</h1>
            <SlidersHorizontalIcon class="size-6 text-black/40" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          class="block w-full sm:max-w-100 lg:hidden"
        >
          <SheetHeader class="px-5 pt-4">
            <SheetTitle>
              <h1 class="text-2xl font-bold">Filter</h1>
            </SheetTitle>
            <SheetDescription>
              Use the available filters to refine your product search.
            </SheetDescription>
          </SheetHeader>

          <div class="h-[calc(100vh-6.1rem)] overflow-y-auto px-5 pb-5">
            <ShopFilter />
          </div>
        </SheetContent>
      </Sheet>

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

    <Pagination
      v-if="paginationProducts && paginationProducts.totalPages > 1"
      v-slot="{ page }"
      :total="paginationProducts.total"
      :items-per-page="21"
      :sibling-count="1"
      :default-page="currentPage"
      show-edges
      @update:page="(p) => setFilters({ page: String(p) }, false)"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious />

        <template
          v-for="(item, index) in items"
          :key="index"
        >
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === page"
          >
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-else />
        </template>

        <PaginationNext />
      </PaginationContent>
    </Pagination>
  </section>
</template>

<style scoped></style>
