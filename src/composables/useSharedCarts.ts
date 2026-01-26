import { cartsService } from '@/services/carts.service'

import type { CartItemWithDetails, CartWithItems } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useClipboard } from '@vueuse/core'
import { io, Socket } from 'socket.io-client'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

// Global state for shared cart (singleton pattern)

export const useSharedCart = () => {
  const queryClient = useQueryClient()
  const route = useRoute()
  const { copy } = useClipboard()

  const socket = ref<Socket | null>(null)
  const shareToken = ref<string | null>(null)
  let currentCartId: string | null = null

  // Sync shareToken with route.query.share automatically
  watch(
    () => route.query.share as string | undefined,
    (newToken) => {
      shareToken.value = newToken ?? null
    },
    { immediate: true },
  )

  const query = useQuery({
    queryKey: ['shared-cart', shareToken],
    queryFn: () => {
      if (!shareToken.value) throw new Error('No share token')

      return cartsService.getSharedCart(shareToken.value)
    },
    enabled: computed(() => !!shareToken.value),
    retry: 1,
    staleTime: Infinity,
  })

  const sharedCart = computed(() => query.data.value)

  const sharedCartItems = computed(() => query.data.value?.cartItems || [])

  const isLoadingShared = computed(() => query.isLoading.value)

  const isErrorShared = computed(() => query.isError.value)

  const errorShared = computed(() => query.error.value)

  const sharedCartSubtotal = computed(() => {
    return sharedCartItems.value.reduce(
      (total: number, item: CartItemWithDetails) => {
        const price =
          item.productVariant?.price ??
          item.productVariant?.basePrice ??
          item.product?.price ??
          item.product?.basePrice ??
          0
        return total + price * item.quantity
      },
      0,
    )
  })

  const sharedCartLastActivityAt = computed(
    () => query.data.value?.lastActivityAt,
  )

  const connectSocket = (cartId: string) => {
    if (socket.value && currentCartId === cartId) {
      return
    }

    if (socket.value && currentCartId && currentCartId !== cartId) {
      socket.value.emit('leave-cart', currentCartId)
    }

    if (!socket.value) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const socketUrl = apiUrl.replace(/\/api\/?$/, '')
      socket.value = io(socketUrl)

      socket.value.on('connect', () => {
        if (currentCartId) {
          socket.value?.emit('join-cart', currentCartId)
        }
      })

      socket.value.on('cart:updated', (updatedCart: CartWithItems) => {
        queryClient.setQueryData(['shared-cart', shareToken.value], updatedCart)
        toast.info('Cart updated')
      })

      socket.value.on('disconnect', () => {})
    }

    currentCartId = cartId
    if (socket.value.connected) {
      socket.value.emit('join-cart', cartId)
    }
  }

  watch(
    () => query.data.value?.id,
    (newCartId, oldCartId) => {
      if (newCartId && !!shareToken.value) {
        connectSocket(newCartId)
      } else if (!shareToken.value && oldCartId) {
        if (socket.value && currentCartId) {
          socket.value.emit('leave-cart', currentCartId)
          currentCartId = null
        }
      }
    },
    { immediate: true },
  )

  // Disconnect socket when leaving shared view
  watch(shareToken, (token) => {
    if (!token && socket.value) {
      if (currentCartId) {
        socket.value.emit('leave-cart', currentCartId)
        currentCartId = null
      }
      socket.value.disconnect()
      socket.value = null
      queryClient.setQueryData(['shared-cart', null], null)
    }
  })

  onUnmounted(() => {
    if (socket.value) {
      if (currentCartId) {
        socket.value.emit('leave-cart', currentCartId)
      }
      socket.value.disconnect()
      socket.value = null
    }
  })

  const shareCartMutation = useMutation({
    mutationFn: () => cartsService.shareCart(),
    onSuccess: (data) => {
      const params = new URLSearchParams()

      Object.entries(route.query).forEach(([key, value]) => {
        if (key !== 'share' && value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)))
          } else {
            params.set(key, String(value))
          }
        }
      })

      params.set('share', data.shareToken)

      const queryString = params.toString()
      copy(`${window.location.origin}/cart?${queryString}`)
      toast.success('Link copied to clipboard')
    },
    onError: (err) => {
      toast.error(err.message || 'Could not create share link')
    },
  })

  const importSharedCartMutation = useMutation({
    mutationFn: async () => {
      if (!shareToken.value) throw new Error('No share token')
      return cartsService.mergeSharedCart(shareToken.value)
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['carts'], updatedCart)
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Items imported to your cart successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to import shared cart')
    },
  })

  const shareCart = async () => {
    return shareCartMutation.mutateAsync()
  }

  const importSharedCart = async () => {
    return importSharedCartMutation.mutateAsync()
  }

  const refetchSharedCart = () => {
    return query.refetch()
  }

  return {
    // Data
    shareToken,
    sharedCart,
    sharedCartItems,
    sharedCartSubtotal,
    sharedCartLastActivityAt,

    // Query states
    isLoadingShared,
    isErrorShared,
    errorShared,
    refetchSharedCart,

    // Actions
    shareCart,
    importSharedCart,

    // Mutation loading states
    isLoadingShareToken: shareCartMutation.isPending,
    isImportingSharedCart: importSharedCartMutation.isPending,
  }
}
