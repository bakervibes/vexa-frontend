<script setup lang="ts">
import { useFeaturedProducts } from '@/composables/useProducts'
import ProductCard from '../../common/ProductCard.vue'
import ProductCardSkeleton from '../../common/ProductCardSkeleton.vue'

const { featuredProducts, isLoadingFeaturedProducts } = useFeaturedProducts()
</script>

<template>
  <section class="mx-auto w-full max-w-6xl px-6 py-32">
    <div class="text-gold mb-6 text-center text-xs tracking-[0.3em] uppercase">
      Produits
    </div>

    <h2
      class="font-display text-text mb-4 text-center text-5xl font-light md:text-6xl"
    >
      Nouveautés
      <span class="italic">exclusives</span>
    </h2>

    <div class="bg-gold/40 mx-auto my-12 h-px w-24" />

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
