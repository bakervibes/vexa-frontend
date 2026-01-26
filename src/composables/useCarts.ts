import { cartsService } from '@/services/carts.service'
import type {
  addCartItemInput,
  RemoveCartItemInput,
  UpdateCartItemInput,
} from '@/validators/carts.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

export const useCarts = () => {
  const queryClient = useQueryClient()

  // ========================================
  // Query
  // ========================================
  const query = useQuery({
    queryKey: ['carts'],
    queryFn: () => cartsService.getCart(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  // ========================================
  // Computed (getters)
  // ========================================
  const cart = computed(() => query.data.value)

  const cartItems = computed(() => query.data.value?.cartItems || [])

  const cartItemsCount = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.quantity, 0)
  })

  const cartSubtotal = computed(() => {
    return cartItems.value.reduce((total, item) => {
      const price =
        item.productVariant?.price ??
        item.productVariant?.basePrice ??
        item.product?.price ??
        item.product?.basePrice ??
        0
      return total + price * item.quantity
    }, 0)
  })

  const isCartEmpty = computed(() => cartItems.value.length === 0)

  const cartLastActivityAt = computed(() => query.data.value?.lastActivityAt)

  const isLoadingCart = computed(() => query.isLoading.value)

  const isErrorCart = computed(() => query.isError.value)

  const errorCart = computed(() => query.error.value)

  // ========================================
  // Helper function to invalidate product queries
  // ========================================
  function invalidateProductQueries() {
    queryClient.invalidateQueries({ queryKey: ['carts'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  // ========================================
  // Mutations
  // ========================================
  const addCartItemMutation = useMutation({
    mutationFn: (data: addCartItemInput) => cartsService.addCartItem(data),
    onSuccess: () => {
      invalidateProductQueries()
      toast.success('Product added to cart')
    },
    onError: (err) => {
      toast.error(err.message || 'Error adding to cart')
    },
  })

  const updateCartItemMutation = useMutation({
    mutationFn: (data: UpdateCartItemInput) => cartsService.updateItem(data),
    onSuccess: () => {
      invalidateProductQueries()
      toast.success('Product updated in cart')
    },
    onError: (err) => {
      toast.error(err.message || 'Error updating item')
    },
  })

  const removeCartItemMutation = useMutation({
    mutationFn: (data: RemoveCartItemInput) => cartsService.removeItem(data),
    onSuccess: () => {
      invalidateProductQueries()
      toast.success('Product removed from cart successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Error removing item')
    },
  })

  const clearCartMutation = useMutation({
    mutationFn: () => cartsService.clearCart(),
    onSuccess: () => {
      invalidateProductQueries()
      toast.success('Cart cleared successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Error clearing cart')
    },
  })

  // ========================================
  // Actions
  // ========================================
  function addCartItem(
    productId: string,
    quantity: number,
    variantId?: string,
  ) {
    return addCartItemMutation.mutateAsync({
      productId,
      quantity,
      variantId,
    })
  }

  function updateCartItem(itemId: string, quantity: number) {
    return updateCartItemMutation.mutateAsync({
      itemId,
      quantity,
    })
  }

  function removeCartItem(itemId: string) {
    return removeCartItemMutation.mutateAsync({
      itemId,
    })
  }

  function clearCart() {
    return clearCartMutation.mutateAsync()
  }

  function refetchCart() {
    return query.refetch()
  }

  return {
    // Data
    cart,
    cartItems,
    cartItemsCount,
    cartSubtotal,
    cartLastActivityAt,
    isCartEmpty,

    // Query states
    isLoadingCart,
    isErrorCart,
    errorCart,
    refetchCart,

    // Actions
    addCartItem,
    updateCartItem,
    removeCartItem,
    clearCart,

    // Mutation loading states
    isAddingCartItem: computed(() => addCartItemMutation.isPending.value),
    isUpdatingCartItem: computed(() => updateCartItemMutation.isPending.value),
    isRemovingCartItem: computed(() => removeCartItemMutation.isPending.value),
    isClearingCart: computed(() => clearCartMutation.isPending.value),
  }
}
