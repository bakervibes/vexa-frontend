<script setup lang="ts">
/**
 * HomePage
 * Home page - uses DefaultLayout
 */
import BrandSection from '@/components/views/home/brand/BrandSection.vue'
import CategoriesSection from '@/components/views/home/categories/CategoriesSection.vue'
import DiscountSection from '@/components/views/home/discount/DiscountSection.vue'
import HeroSection from '@/components/views/home/hero/HeroSection.vue'
import ProductsSection from '@/components/views/home/products/ProductsSection.vue'
import TermSection from '@/components/views/home/terms/TermSection.vue'
import {
  useSeo,
  useOrganizationSchema,
  useSearchBoxSchema,
} from '@/composables/useSeo'

// SEO
useSeo({
  title: 'Accueil',
  description:
    'Vexa - Votre boutique en ligne. Découvrez nos produits de qualité, nos offres exclusives et profitez de la livraison rapide.',
})

// Structured data
useOrganizationSchema()
useSearchBoxSchema()
</script>

<template>
  <div class="flex flex-col">
    <HeroSection />

    <BrandSection />

    <CategoriesSection />

    <ProductsSection />

    <TermSection />

    <DiscountSection />
  </div>
</template>

<style scoped></style>
