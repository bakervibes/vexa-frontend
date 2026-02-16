<script setup lang="ts">
import { ProductForm } from '@/components/admin/products'
import { AdminPageHeader } from '@/components/admin/shared'
import { useProduct } from '@/composables/useProducts'
import { Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const productId = computed(() => route.params.id as string)
const { product, isLoadingProduct } = useProduct(productId)
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Modifier le produit"
      :description="product?.name || 'Chargement...'"
    />

    <div
      v-if="isLoadingProduct"
      class="flex h-64 items-center justify-center"
    >
      <Loader2 class="text-muted-foreground h-8 w-8 animate-spin" />
    </div>

    <ProductForm
      v-else
      :product="product"
    />
  </div>
</template>
