<script setup lang="ts">
import { ProductForm } from '@/components/admin/products'
import { AdminPageHeader } from '@/components/admin/shared'
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Nouveau produit"
      description="Creer un nouveau produit dans votre catalogue"
    />

    <ProductForm />
  </div>
</template>
