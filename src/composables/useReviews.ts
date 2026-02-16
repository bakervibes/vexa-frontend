import { reviewService } from '@/services/reviews.service'
import type { ReviewWithUser } from '@/types'
import type {
  AddReviewInput,
  UpdateReviewInput,
} from '@/validators/reviews.validator'
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { toast } from 'vue-sonner'

export const useReviews = (
  productIdRef: MaybeRefOrGetter<string | undefined>,
) => {
  const queryClient = useQueryClient()
  const limit = 6

  // Computed productId for reactivity
  const productId = computed(() => toValue(productIdRef))

  // ================================
  // QUERY -- fetch reviews (Infinite)
  // ================================
  const reviewsQuery = useInfiniteQuery({
    queryKey: computed(() => ['reviews', productId.value]),
    queryFn: ({ pageParam = 1 }) => {
      const id = productId.value
      if (!id) throw new Error('Missing product ID')

      return reviewService.getReviews(id, {
        page: pageParam.toString(),
        limit: limit.toString(),
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.hasMore) {
        return lastPage.meta.page + 1
      }
      return undefined
    },
    enabled: computed(() => !!productId.value),
  })

  // Flatten all pages to get a single list of reviews
  const reviews = computed<ReviewWithUser[]>(
    () => reviewsQuery.data.value?.pages.flatMap((page) => page.data) ?? [],
  )

  // Get total from the first page (or 0 if no data)
  const totalReviews = computed(
    () => reviewsQuery.data.value?.pages[0]?.meta.total ?? 0,
  )

  const hasMoreReviews = computed(() => reviewsQuery.hasNextPage.value)

  // Load more
  async function loadMoreReviews() {
    if (hasMoreReviews.value && !reviewsQuery.isFetchingNextPage.value) {
      await reviewsQuery.fetchNextPage()
    }
  }

  // Reset + refresh
  function resetReviews() {
    // Invalidate resets the infinite query to page 1
    queryClient.invalidateQueries({ queryKey: ['reviews', productId.value] })
  }

  async function refreshReviews() {
    await queryClient.invalidateQueries({
      queryKey: ['reviews', productId.value],
    })
  }

  // ================================
  // MUTATIONS
  // ================================
  const addReviewMutation = useMutation({
    mutationFn: (data: AddReviewInput & { slug: string }) =>
      reviewService.addReview({
        productId: data.productId,
        comment: data.comment,
        rating: data.rating,
      }),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products', vars.slug] })
      queryClient.invalidateQueries({ queryKey: ['reviews', productId.value] })
      toast.success('Review added successfully')
    },
    onError: (err) => toast.error(err.message),
  })

  const updateReviewMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: { id: string; data: UpdateReviewInput } & { slug: string }) =>
      reviewService.updateReview(id, data),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products', vars.slug] })
      queryClient.invalidateQueries({ queryKey: ['reviews', productId.value] })
      toast.success('Review updated successfully')
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteReviewMutation = useMutation({
    mutationFn: ({ id }: { id: string } & { slug: string }) =>
      reviewService.deleteReview(id),
    onSuccess: (_res, vars) => {
      queryClient.invalidateQueries({ queryKey: ['products', vars.slug] })
      queryClient.invalidateQueries({ queryKey: ['reviews', productId.value] })
      toast.success('Review deleted successfully')
    },
    onError: (err) => toast.error(err.message),
  })

  return {
    // data
    reviews,
    totalReviews,
    hasMoreReviews,
    // pagination: not strictly needed exposed as 'pagination' object anymore,
    // but we exposed individual fields. If 'pagination' object was used, it needs check.
    // Checking usage in ReviewSection... it was only used to derive total/hasMore within this file.
    // Except... wait, let me check strict usage in ReviewsSection.vue one more time.

    // loadings
    isLoadingReviews: computed(() => reviewsQuery.isLoading.value),
    isFetchingReviews: computed(() => reviewsQuery.isFetchingNextPage.value), // Mapped to next page fetch for the button
    errorReviews: computed(() => reviewsQuery.error.value),

    // actions
    loadMoreReviews,
    resetReviews,
    refreshReviews,

    // mutations
    addReview: addReviewMutation.mutateAsync,
    updateReview: updateReviewMutation.mutateAsync,
    deleteReview: deleteReviewMutation.mutateAsync,

    isAddingReview: computed(() => addReviewMutation.isPending.value),
    isUpdatingReview: computed(() => updateReviewMutation.isPending.value),
    isDeletingReview: computed(() => deleteReviewMutation.isPending.value),
  }
}
