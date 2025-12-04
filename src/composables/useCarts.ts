import { cartService } from '@/services/carts.service'
import type {
  AddToCartInput,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from '@/validators/carts.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Composable to fetch and display the cart
 */
export function useCarts() {
  const query = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  // ========================================
  // Computed (getters)
  // ========================================
  const items = computed(() => query.data.value?.items || [])

  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => {
      const price =
        item.variant?.price ??
        item.variant?.basePrice ??
        item.product?.price ??
        item.product?.basePrice ??
        0
      return total + price * item.quantity
    }, 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  return {
    // Data
    cart: computed(() => query.data.value),
    items,
    itemCount,
    subtotal,
    isEmpty,

    // Loading states
    isLoadingCart: computed(() => query.isLoading.value),
    isErrorCart: computed(() => query.isError.value),
    refetchCart: query.refetch,
  }
}

/**
 * Composable for cart mutations (add, update, remove, clear)
 */
export function useCartsMutation() {
  const queryClient = useQueryClient()

  // ========================================
  // Helper function to invalidate product queries
  // ========================================
  function invalidateProductQueries(slugs: string[]) {
    for (const slug of slugs) {
      queryClient.invalidateQueries({ queryKey: ['products', slug] })
    }

    queryClient.invalidateQueries({ queryKey: ['cart'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['products', 'featured'] })
  }

  // ========================================
  // Mutations
  // ========================================
  const addToCartMutation = useMutation({
    mutationFn: (data: AddToCartInput & { slug: string }) =>
      cartService.addToCart({
        productId: data.productId,
        quantity: data.quantity,
        variantId: data.variantId,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      invalidateProductQueries([variables.slug])
      toast.success('Product added to cart')
    },
    onError: (err) => {
      toast.error(err.message || 'Error adding to cart')
    },
  })

  const updateCartItemMutation = useMutation({
    mutationFn: (data: UpdateCartItemInput & { slug: string }) =>
      cartService.updateItem({
        productId: data.productId,
        quantity: data.quantity,
        variantId: data.variantId,
      }),
    onSuccess: (_data, variables) => {
      invalidateProductQueries([variables.slug])
    },
    onError: (err) => {
      toast.error(err.message || 'Error updating item')
    },
  })

  const removeCartItemMutation = useMutation({
    mutationFn: (data: RemoveCartItemInput & { slug: string }) =>
      cartService.removeItem({
        productId: data.productId,
        variantId: data.variantId,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      invalidateProductQueries([variables.slug])
      toast.success('Product removed from cart successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Error removing item')
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: (_data: { slugs: string[] }) => cartService.clearCart(),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      invalidateProductQueries(variables.slugs)
      toast.success('Cart cleared successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Error clearing cart')
    },
  })

  // ========================================
  // Actions
  // ========================================
  function addToCart(
    productId: string,
    quantity: number,
    variantId?: string,
    slug?: string,
  ) {
    return addToCartMutation.mutateAsync({
      productId,
      quantity,
      variantId,
      slug: slug || '',
    })
  }

  function updateCartItem(
    productId: string,
    quantity: number,
    variantId?: string,
    slug?: string,
  ) {
    return updateCartItemMutation.mutateAsync({
      productId,
      quantity,
      variantId,
      slug: slug || '',
    })
  }

  function removeCartItem(
    productId: string,
    variantId?: string,
    slug?: string,
  ) {
    return removeCartItemMutation.mutateAsync({
      productId,
      variantId,
      slug: slug || '',
    })
  }

  function clearCart(slugs: string[]) {
    return clearCartMutation.mutateAsync({ slugs })
  }

  return {
    // Actions
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,

    // Loading states
    isAddingCartItem: computed(() => addToCartMutation.isPending.value),
    isUpdatingCartItem: computed(() => updateCartItemMutation.isPending.value),
    isRemovingCartItem: computed(() => removeCartItemMutation.isPending.value),
    isClearingCart: computed(() => clearCartMutation.isPending.value),
  }
}
