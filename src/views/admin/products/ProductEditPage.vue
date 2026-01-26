<script setup lang="ts">
import { ProductForm } from '@/components/admin/products'
import { AdminPageHeader } from '@/components/admin/shared'
import { useProduct, useProducts } from '@/composables/useProducts'
import type { CreateProductInput } from '@/validators/products.validator'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()

const productId = computed(() => route.params.id as string)
const { product, isLoadingProduct } = useProduct(productId)
const { updateProduct, isUpdatingProduct } = useProducts()

async function handleSubmit(data: CreateProductInput) {
  try {
    await updateProduct(productId.value, data)
    toast.success('Produit mis à jour avec succès')
    router.push('/admin/products')
  } catch {
    toast.error('Erreur lors de la mise à jour du produit')
  }
}

function handleCancel() {
  router.push('/admin/products')
}
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
      <svg
        class="text-muted-foreground h-8 w-8 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>

    <div
      v-else
      class="bg-card rounded-xl border p-6"
    >
      <ProductForm
        :product="product"
        :loading="isUpdatingProduct"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
