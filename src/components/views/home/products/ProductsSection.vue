<script setup lang="ts">
import { useFeaturedProducts } from '@/composables/useProducts'
import ProductCard from '../../common/ProductCard.vue'
import ProductCardSkeleton from '../../common/ProductCardSkeleton.vue'

const { featuredProducts, isLoadingFeaturedProducts } = useFeaturedProducts()
</script>

<template>
  <section class="mx-auto w-full max-w-7xl space-y-4 px-4 py-6">
    <h2 class="text-xl font-bold text-black sm:text-2xl">New arrivals</h2>

    <div
      v-if="isLoadingFeaturedProducts"
      class="flex gap-4 overflow-x-auto pb-6"
    >
      <ProductCardSkeleton
        v-for="i in 9"
        :key="i"
      />
    </div>

    <div
      v-else
      class="flex gap-4 overflow-x-auto pb-6"
    >
      <ProductCard
        v-for="product in featuredProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>

<style scoped></style>
