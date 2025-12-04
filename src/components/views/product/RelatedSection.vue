<script setup lang="ts">
import { useRelatedProducts } from '@/composables/useProducts'
import { ArrowRightIcon } from 'lucide-vue-next'
import Button from 'primevue/button'
import ProductCard from '../common/ProductCard.vue'

const props = defineProps<{
  slug: string
}>()

const { relatedProducts } = useRelatedProducts(props.slug)
</script>

<template>
  <!-- Related Products Section -->
  <section class="mx-auto w-full max-w-7xl space-y-4 px-4 py-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-black sm:text-2xl">
        You might also like
      </h2>

      <RouterLink to="/shop">
        <Button link>
          More products
          <ArrowRightIcon />
        </Button>
      </RouterLink>
    </div>

    <div class="flex gap-4 overflow-x-auto pb-6">
      <ProductCard
        v-for="product in relatedProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </section>
</template>
