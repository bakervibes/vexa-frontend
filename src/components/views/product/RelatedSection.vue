<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useRelatedProducts } from '@/composables/useProducts'
import { ArrowRightIcon } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import ProductCard from '../common/ProductCard.vue'

const props = defineProps<{
  slug: string
}>()

const { relatedProducts } = useRelatedProducts(() => props.slug)
</script>

<template>
  <section class="mx-auto w-full max-w-7xl space-y-6 bg-[#0A0A0A] px-4 py-12">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
          Discover More
        </p>
        <h2 class="font-display text-5xl font-light text-[#E8E8E8]">
          You might also like
        </h2>
      </div>

      <RouterLink to="/shop">
        <Button
          variant="outline"
          class="border border-[#C8A97E]/40 text-[#C8A97E] uppercase hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
        >
          More products
          <ArrowRightIcon class="ml-2 h-4 w-4" />
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
