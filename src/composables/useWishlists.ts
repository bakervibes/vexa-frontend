import { wishlistService } from '@/services/wishlists.service'
import type {
  addWishlistItemInput,
  removeWishlistItemInput,
} from '@/validators/wishlists.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

export const useWishlists = () => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const wishlist = computed(() => query.data.value)

  const wishlistItems = computed(() => query.data.value?.wishlistItems || [])

  const isEmptyWishlist = computed(
    () => query.data.value?.wishlistItems.length === 0,
  )

  const wishlistUpdatedAt = computed(() => query.data.value?.updatedAt)

  const isLoadingWishlist = computed(() => query.isLoading.value)

  const isErrorWishlist = computed(() => query.isError.value)

  const errorWishlist = computed(() => query.error.value?.message)

  function invalidateProductQueries() {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['wishlist'] })
  }

  // ========================================
  // Mutations
  // ========================================
  const addWishlistItemMutation = useMutation({
    mutationFn: (data: addWishlistItemInput) =>
      wishlistService.addWishlistItem(data),
    onSuccess: () => {
      invalidateProductQueries()
      toast.success('Product added to wishlist')
    },
    onError: (err) => {
      toast.error(err.message || 'Error adding to wishlist')
    },
  })

  const removeWishlistItemMutation = useMutation({
    mutationFn: (data: removeWishlistItemInput) =>
      wishlistService.removeWishlistItem(data),
    onSuccess: () => {
      invalidateProductQueries()
      toast.success('Product removed from wishlist')
    },
    onError: (err) => {
      toast.error(err.message || 'Error removing item')
    },
  })

  const clearWishlistMutation = useMutation({
    mutationFn: () => wishlistService.clearWishlist(),
    onSuccess: () => {
      invalidateProductQueries()
      toast.success('Wishlist cleared')
    },
    onError: (err) => {
      toast.error(err.message || 'Error clearing wishlist')
    },
  })

  const importFromCartMutation = useMutation({
    mutationFn: (token: string | null) => wishlistService.importFromCart(token),
    onSuccess: () => {
      invalidateProductQueries()
      toast.success('Items imported from cart')
    },
    onError: (err) => {
      toast.error(err.message || 'Error importing from cart')
    },
  })

  // ========================================
  // Actions
  // ========================================
  function refetchWishlist() {
    return query.refetch()
  }

  function addWishlistItem(productId: string, variantId?: string) {
    return addWishlistItemMutation.mutateAsync({
      productId,
      variantId,
    })
  }

  function removeWishlistItem(productId: string, variantId?: string) {
    return removeWishlistItemMutation.mutateAsync({
      productId,
      variantId,
    })
  }

  function clearWishlist() {
    return clearWishlistMutation.mutateAsync()
  }

  function importFromCart(shareToken: string | null) {
    return importFromCartMutation.mutateAsync(shareToken)
  }

  return {
    // Data
    wishlist,
    wishlistItems,
    wishlistUpdatedAt,
    isEmptyWishlist,

    // Query states
    isLoadingWishlist,
    isErrorWishlist,
    errorWishlist,
    refetchWishlist,

    // Actions
    addWishlistItem,
    removeWishlistItem,
    clearWishlist,
    importFromCart,

    // Mutation loading states
    isAddingToWishlist: computed(() => addWishlistItemMutation.isPending.value),
    isRemovingWishlistItem: computed(
      () => removeWishlistItemMutation.isPending.value,
    ),
    isClearingWishlist: computed(() => clearWishlistMutation.isPending.value),
    isImportingFromCart: computed(() => importFromCartMutation.isPending.value),
  }
}
