<script setup lang="ts">
import { ProductTable } from '@/components/admin/products'
import { AdminPageHeader, ConfirmDialog } from '@/components/admin/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProducts } from '@/composables/useProducts'
import type { ProductWithDetails } from '@/types'
import { Plus, Search } from 'lucide-vue-next'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const router = useRouter()
const {
  products,
  isLoadingProducts,
  deleteProduct,
  isDeletingProduct,
  fetchNextPage,
  hasNextPage,
} = useProducts()

const searchQuery = ref('')
const productToDelete = ref<ProductWithDetails | null>(null)
const showDeleteDialog = ref(false)

function handleView(product: ProductWithDetails) {
  window.open(`/products/${product.slug}`, '_blank')
}

function handleEdit(product: ProductWithDetails) {
  router.push(`/admin/products/${product.slug}/edit`)
}

function handleDelete(product: ProductWithDetails) {
  productToDelete.value = product
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (!productToDelete.value) return
  try {
    await deleteProduct(productToDelete.value.id)
    toast.success('Produit supprimé avec succès')
    showDeleteDialog.value = false
    productToDelete.value = null
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}

function handleCreate() {
  router.push('/admin/products/create')
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Produits"
      description="Gérez votre catalogue de produits"
    >
      <template #actions>
        <Button @click="handleCreate">
          <Plus class="mr-2 h-4 w-4" />
          Nouveau produit
        </Button>
      </template>
    </AdminPageHeader>

    <!-- Search -->
    <div class="flex items-center gap-4">
      <div class="relative max-w-sm flex-1">
        <Search
          class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <Input
          v-model="searchQuery"
          placeholder="Rechercher un produit..."
          class="pl-9"
        />
      </div>
    </div>

    <!-- Products Table -->
    <ProductTable
      :products="products"
      :loading="isLoadingProducts"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- Pagination -->
    <div
      v-if="hasNextPage"
      class="flex justify-center"
    >
      <Button
        variant="outline"
        @click="() => fetchNextPage()"
      >
        Charger plus
      </Button>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      title="Supprimer le produit"
      :description="`Êtes-vous sûr de vouloir supprimer « ${productToDelete?.name} » ? Cette action est irréversible.`"
      confirm-text="Supprimer"
      variant="destructive"
      :loading="isDeletingProduct"
      @confirm="confirmDelete"
    />
  </div>
</template>
