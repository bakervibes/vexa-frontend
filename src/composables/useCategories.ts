import { categoriesService } from '@/services/categories.service'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/validators/categories.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Hook to manage categories state and mutations
 */
export const useCategories = () => {
  const queryClient = useQueryClient()

  // ========================================
  // Queries
  // ========================================
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const bestSellingQuery = useQuery({
    queryKey: ['categories', 'best-selling'],
    queryFn: () => categoriesService.getBestSelling(),
    staleTime: 1000 * 60 * 15,
    retry: 1,
  })

  // ========================================
  // Mutations
  // ========================================
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
  // Computed
  // ========================================
  const categories = computed(() => categoriesQuery.data.value || [])
  const isLoadingCategories = computed(() => categoriesQuery.isLoading.value)
  const isErrorCategories = computed(() => categoriesQuery.isError.value)

  const bestSellingCategories = computed(
    () => bestSellingQuery.data.value || [],
  )
  const isLoadingBestSellingCategories = computed(
    () => bestSellingQuery.isLoading.value,
  )
  const isErrorBestSellingCategories = computed(
    () => bestSellingQuery.isError.value,
  )

  // ========================================
  // Actions
  // ========================================
  function refetchCategories() {
    return categoriesQuery.refetch()
  }

  function refetchBestSellingCategories() {
    return bestSellingQuery.refetch()
  }

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
    // Categories data
    categories,
    isLoadingCategories,
    isErrorCategories,
    refetchCategories,

    // Best selling categories data
    bestSellingCategories,
    isLoadingBestSellingCategories,
    isErrorBestSellingCategories,
    refetchBestSellingCategories,

    // Actions
    createCategory,
    updateCategory,
    deleteCategory,

    // Mutation loading states
    isCreatingCategory: computed(() => createCategoryMutation.isPending.value),
    isUpdatingCategory: computed(() => updateCategoryMutation.isPending.value),
    isDeletingCategory: computed(() => deleteCategoryMutation.isPending.value),
  }
}
