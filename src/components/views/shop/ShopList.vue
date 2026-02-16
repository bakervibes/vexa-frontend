<script setup lang="ts">
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
  <section class="flex flex-1 flex-col gap-6">
    <div class="flex items-center justify-between gap-4">
      <button
        class="border-gold/40 text-gold hover:bg-gold hover:text-noir flex items-center gap-2 border px-5 py-3 text-xs tracking-widest uppercase transition-all lg:hidden"
        @click="isFilterDrawerOpen = true"
      >
        <span>Filtres</span>
        <SlidersHorizontalIcon class="size-4" />
      </button>

      <Sheet v-model:open="isFilterDrawerOpen">
        <SheetContent
          side="left"
          class="text-text bg-noir border-border-noir border-r"
        >
          <SheetHeader class="text-left">
            <SheetTitle class="font-display text-text text-2xl font-light">
              Filtres
            </SheetTitle>
            <SheetDescription class="text-[#555]">
              Utilisez les filtres pour affiner votre recherche.
            </SheetDescription>
          </SheetHeader>

          <div class="mt-6 flex-1 overflow-y-auto">
            <ShopFilter />
          </div>
        </SheetContent>
      </Sheet>

      <p class="hidden text-xs tracking-widest text-[#555] uppercase sm:block">
        {{ paginationProducts?.total || 0 }} produits
      </p>

      <ShopSort />
    </div>

    <div
      v-if="isLoadingProducts"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
    >
      <ProductCardSkeleton
        v-for="i in 9"
        :key="i"
      />
    </div>

    <div
      v-else-if="products.length === 0"
      class="flex flex-1 items-center justify-center py-16"
    >
      <div class="flex flex-col items-center gap-4 text-center">
        <div class="border-border-noir border p-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-10 text-[#555]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p class="text-text text-lg font-light">Aucun produit trouvé</p>
        <p class="text-sm text-[#555]">Essayez de modifier vos filtres.</p>
      </div>
    </div>

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
