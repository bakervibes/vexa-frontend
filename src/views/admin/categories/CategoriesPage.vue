<script setup lang="ts">
import { CategoryForm, CategoryTable } from '@/components/admin/categories'
import { AdminPageHeader, ConfirmDialog } from '@/components/admin/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCategories } from '@/composables/useCategories'
import type { CategoryWithChildren } from '@/types'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/validators/categories.validator'
import { Plus } from 'lucide-vue-next'
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const {
  categories,
  isLoadingCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  isCreatingCategory,
  isUpdatingCategory,
  isDeletingCategory,
} = useCategories()

const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const categoryToEdit = ref<CategoryWithChildren | null>(null)
const categoryToDelete = ref<CategoryWithChildren | null>(null)

function handleCreate() {
  categoryToEdit.value = null
  showFormDialog.value = true
}

function handleEdit(category: CategoryWithChildren) {
  categoryToEdit.value = category
  showFormDialog.value = true
}

function handleDelete(category: CategoryWithChildren) {
  categoryToDelete.value = category
  showDeleteDialog.value = true
}

async function handleSubmit(data: CreateCategoryInput) {
  try {
    if (categoryToEdit.value) {
      await updateCategory(categoryToEdit.value.id, data as UpdateCategoryInput)
      toast.success('Catégorie mise à jour avec succès')
    } else {
      await createCategory(data)
      toast.success('Catégorie créée avec succès')
    }
    showFormDialog.value = false
    categoryToEdit.value = null
  } catch {
    toast.error("Erreur lors de l'enregistrement")
  }
}

async function confirmDelete() {
  if (!categoryToDelete.value) return
  try {
    await deleteCategory(categoryToDelete.value.id)
    toast.success('Catégorie supprimée avec succès')
    showDeleteDialog.value = false
    categoryToDelete.value = null
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}

function handleCancel() {
  showFormDialog.value = false
  categoryToEdit.value = null
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Catégories"
      description="Gérez les catégories de produits"
    >
      <template #actions>
        <Button @click="handleCreate">
          <Plus class="mr-2 h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </template>
    </AdminPageHeader>

    <!-- Categories Table -->
    <CategoryTable
      :categories="categories"
      :loading="isLoadingCategories"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showFormDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{
              categoryToEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'
            }}
          </DialogTitle>
        </DialogHeader>
        <CategoryForm
          :category="categoryToEdit"
          :categories="categories"
          :loading="isCreatingCategory || isUpdatingCategory"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      title="Supprimer la catégorie"
      :description="`Êtes-vous sûr de vouloir supprimer « ${categoryToDelete?.name} » ? Cette action est irréversible.`"
      confirm-text="Supprimer"
      variant="destructive"
      :loading="isDeletingCategory"
      @confirm="confirmDelete"
    />
  </div>
</template>
