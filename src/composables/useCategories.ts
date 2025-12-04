import { categoriesService } from '@/services/categories.service'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/validators/categories.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

export function useCategories() {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  return {
    categories: computed(() => query.data.value || []),
    isLoadingCategories: computed(() => query.isLoading.value),
    isErrorCategories: computed(() => query.isError.value),
    refetchCategories: query.refetch,
  }
}

export function useBestSellingCategories() {
  const query = useQuery({
    queryKey: ['categories', 'best-selling'],
    queryFn: () => categoriesService.getBestSelling(),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  })

  return {
    bestSellingCategories: computed(() => query.data.value || []),
    isLoadingBestSellingCategories: computed(() => query.isLoading.value),
    isErrorBestSellingCategories: computed(() => query.isError.value),
    refetchBestSellingCategories: query.refetch,
  }
}

export const useCategoriesMutation = () => {
  const queryClient = useQueryClient()

  const createCategoryMutation = useMutation({
    mutationFn: (data: CreateCategoryInput) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category created successfully !')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error creating category')
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: (data: { id: string; payload: UpdateCategoryInput }) =>
      categoriesService.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error updating category')
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully !')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error deleting category')
    },
  })

  // ========================================
  // Actions
  // ========================================

  function createCategory(data: CreateCategoryInput) {
    return createCategoryMutation.mutateAsync(data)
  }

  function updateCategory(id: string, payload: UpdateCategoryInput) {
    return updateCategoryMutation.mutateAsync({ id, payload })
  }

  function deleteCategory(id: string) {
    return deleteCategoryMutation.mutateAsync(id)
  }

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    isCreatingCategory: computed(() => createCategoryMutation.isPending.value),
    isUpdatingCategory: computed(() => updateCategoryMutation.isPending.value),
    isDeletingCategory: computed(() => deleteCategoryMutation.isPending.value),
  }
}
