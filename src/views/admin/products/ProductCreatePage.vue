<script setup lang="ts">
import { ProductForm } from '@/components/admin/products'
import { AdminPageHeader } from '@/components/admin/shared'
import { useProducts } from '@/composables/useProducts'
import type { CreateProductInput } from '@/validators/products.validator'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const { createProduct, isCreatingProduct } = useProducts()

async function handleSubmit(data: CreateProductInput) {
  try {
    await createProduct(data)
    toast.success('Produit créé avec succès')
    router.push('/admin/products')
  } catch {
    toast.error('Erreur lors de la création du produit')
  }
}

function handleCancel() {
  router.push('/admin/products')
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Nouveau produit"
      description="Créer un nouveau produit dans votre catalogue"
    />

    <div class="bg-card rounded-xl border p-6">
      <ProductForm
        :loading="isCreatingProduct"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
