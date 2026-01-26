<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useProducts } from '@/composables/useProducts'
import { useInfiniteScroll } from '@vueuse/core'
import { SlidersHorizontalIcon } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import ProductCard from '../common/ProductCard.vue'
import ProductCardSkeleton from '../common/ProductCardSkeleton.vue'
import ShopFilter from './ShopFilter.vue'
import ShopSort from './ShopSort.vue'

const {
  products,
  paginationProducts,
  isLoadingProducts,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  filters,
} = useProducts()

const isFilterDrawerOpen = ref(false)

const { reset } = useInfiniteScroll(
  window,
  () => {
    fetchNextPage()
  },
  {
    distance: 3000,
    canLoadMore: () => {
      return hasNextPage.value && !isFetchingNextPage.value
    },
  },
)

watch(
  filters,
  () => {
    reset()
  },
  { deep: true },
)
</script>

<template>
  <section class="flex flex-1 flex-col gap-4">
    <div class="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        class="flex items-center gap-2 lg:hidden"
        @click="isFilterDrawerOpen = true"
      >
        <span class="text-base font-medium sm:text-lg">Filter</span>
        <SlidersHorizontalIcon class="size-5 text-black/40" />
      </Button>

      <Sheet v-model:open="isFilterDrawerOpen">
        <SheetContent
          side="left"
          class="flex h-full w-full flex-col pr-0 sm:w-100 sm:max-w-none"
        >
          <SheetHeader class="pr-8 text-left">
            <SheetTitle class="text-2xl font-bold">Filter</SheetTitle>
            <SheetDescription>
              Use the available filters to refine your product search.
            </SheetDescription>
          </SheetHeader>

          <div class="flex-1 overflow-y-auto pr-8">
            <ShopFilter />
          </div>
        </SheetContent>
      </Sheet>

      <h1 class="hidden sm:block">
        {{ paginationProducts?.total || 0 }} products
      </h1>

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

    <!-- Infinite Scroll Loading Trigger -->
    <div
      v-if="isFetchingNextPage"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
    >
      <ProductCardSkeleton
        v-for="i in 9"
        :key="i"
      />
    </div>
  </section>
</template>

<style scoped></style>
