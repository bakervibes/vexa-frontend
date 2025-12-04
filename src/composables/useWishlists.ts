import { wishlistService } from '@/services/wishlists.service'
import type {
  AddToWishlistInput,
  RemoveWishlistItemInput,
} from '@/validators/wishlists.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Composable to fetch and display the wishlist
 */
export function useWishlists() {
  const query = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlist(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  return {
    // Data
    wishlist: computed(() => query.data.value),
    items: computed(() => query.data.value?.items || []),
    isEmpty: computed(() => query.data.value?.items.length === 0),

    // Loading states
    isLoadingWishlist: computed(() => query.isLoading.value),
    isErrorWishlist: computed(() => query.isError.value),
    refetchWishlist: query.refetch,
  }
}

/**
 * Composable for wishlist mutations (add, update, remove, clear)
 */
export function useWishlistsMutation() {
  const queryClient = useQueryClient()

  // ========================================
  // Helper function to invalidate product queries
  // ========================================
  function invalidateProductQueries(slugs: string[]) {
    for (const slug of slugs) {
      queryClient.invalidateQueries({ queryKey: ['products', slug] })
    }

    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    queryClient.invalidateQueries({ queryKey: ['products', 'featured'] })
    queryClient.invalidateQueries({ queryKey: ['products', 'related'] })
  }

  // ========================================
  // Mutations
  // ========================================
  const addToWishlistMutation = useMutation({
    mutationFn: (data: AddToWishlistInput & { slug: string }) =>
      wishlistService.addToWishlist({
        productId: data.productId,
        variantId: data.variantId,
      }),
    onSuccess: (_data, variables) => {
      invalidateProductQueries([variables.slug])
      toast.success('Product added to wishlist')
    },
    onError: (err) => {
      toast.error(err.message || 'Error adding to wishlist')
    },
  })

  const removeWishlistItemMutation = useMutation({
    mutationFn: (data: RemoveWishlistItemInput & { slug: string }) =>
      wishlistService.removeWishlistItem({
        productId: data.productId,
        variantId: data.variantId,
      }),
    onSuccess: (_data, variables) => {
      invalidateProductQueries([variables.slug])
      toast.success('Product removed from wishlist')
    },
    onError: (err) => {
      toast.error(err.message || 'Error removing item')
    },
  })

  const clearWishlistMutation = useMutation({
    mutationFn: (_data: { slugs: string[] }) => wishlistService.clearWishlist(),
    onSuccess: (_data, variables) => {
      invalidateProductQueries(variables.slugs)
      toast.success('Wishlist cleared')
    },
    onError: (err) => {
      toast.error(err.message || 'Error clearing wishlist')
    },
  })

  // ========================================
  // Actions
  // ========================================
  function addToWishlist(productId: string, variantId?: string, slug?: string) {
    return addToWishlistMutation.mutateAsync({
      productId,
      variantId,
      slug: slug || '',
    })
  }

  function removeWishlistItem(
    productId: string,
    variantId?: string,
    slug?: string,
  ) {
    return removeWishlistItemMutation.mutateAsync({
      productId,
      variantId,
      slug: slug || '',
    })
  }

  function clearWishlist(slugs: string[]) {
    return clearWishlistMutation.mutateAsync({ slugs })
  }

  return {
    // Actions
    addToWishlist,
    removeWishlistItem,
    clearWishlist,

    // Loading states
    isAddingWishlistItem: computed(() => addToWishlistMutation.isPending.value),
    isRemovingWishlistItem: computed(
      () => removeWishlistItemMutation.isPending.value,
    ),
    isClearingWishlist: computed(() => clearWishlistMutation.isPending.value),
  }
}
