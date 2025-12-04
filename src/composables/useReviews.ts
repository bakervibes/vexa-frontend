import {
  reviewService,
  type PaginatedReviewsResponse,
} from '@/services/reviews.service'
import type { ReviewWithUser } from '@/types'
import type {
  AddReviewInput,
  UpdateReviewInput,
} from '@/validators/reviews.validator'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, ref, type Ref } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Composable for fetching paginated reviews for a product
 */
export function useProductReviews(productId: Ref<string | undefined>) {
  const reviews = ref<ReviewWithUser[]>([])
  const pagination = ref<PaginatedReviewsResponse['pagination'] | null>(null)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<Error | null>(null)
  const currentPage = ref(1)
  const limit = 5

  const hasMore = computed(() => pagination.value?.hasMore ?? false)
  const totalReviews = computed(() => pagination.value?.total ?? 0)

  const fetchReviews = async (page: number = 1, append: boolean = false) => {
    if (!productId.value) return

    if (append) {
      isLoadingMore.value = true
    } else {
      isLoading.value = true
    }
    error.value = null

    try {
      const result = await reviewService.getReviews(productId.value, {
        page: page.toString(),
        limit: limit.toString(),
      })

      if (append) {
        reviews.value = [...reviews.value, ...result.reviews]
      } else {
        reviews.value = result.reviews
      }
      pagination.value = result.pagination
      currentPage.value = page
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  const loadMore = async () => {
    if (!hasMore.value || isLoadingMore.value) return
    await fetchReviews(currentPage.value + 1, true)
  }

  const reset = () => {
    reviews.value = []
    pagination.value = null
    currentPage.value = 1
    error.value = null
  }

  const refresh = async () => {
    reset()
    await fetchReviews(1)
  }

  return {
    reviews: computed(() => reviews.value),
    pagination: computed(() => pagination.value),
    totalReviews,
    hasMore,
    isLoading: computed(() => isLoading.value),
    isLoadingMore: computed(() => isLoadingMore.value),
    error: computed(() => error.value),
    fetchReviews,
    loadMore,
    refresh,
    reset,
  }
}

/**
 * Composable for review mutations (add, update, delete)
 */
export function useReviewsMutation() {
  const queryClient = useQueryClient()

  const addReviewMutation = useMutation({
    mutationFn: (data: AddReviewInput & { slug: string }) =>
      reviewService.addReview({
        productId: data.productId,
        comment: data.comment,
        rating: data.rating,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', variables.slug] })
      toast.success('Review added successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Error adding review')
    },
  })

  const updateReviewMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: UpdateReviewInput } & { slug: string }) =>
      reviewService.updateReview(id, {
        comment: data.comment,
        rating: data.rating,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', variables.slug] })
      toast.success('Review updated successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Error updating review')
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: ({ id }: { id: string } & { slug: string }) =>
      reviewService.deleteReview(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', variables.slug] })
      toast.success('Review deleted successfully !')
    },
    onError: (err) => {
      toast.error(err.message || 'Error deleting review')
    },
  })

  return {
    addReview: addReviewMutation.mutateAsync,
    updateReview: updateReviewMutation.mutateAsync,
    deleteReview: deleteReviewMutation.mutateAsync,

    isAddingReview: computed(() => addReviewMutation.isPending.value),
    isUpdatingReview: computed(() => updateReviewMutation.isPending.value),
    isDeletingReview: computed(() => deleteReviewMutation.isPending.value),
  }
}
