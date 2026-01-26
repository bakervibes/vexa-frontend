import { wishlistService } from '@/services/wishlists.service'
import type { WishlistWithItems } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useClipboard } from '@vueuse/core'
import { io, Socket } from 'socket.io-client'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

export const useSharedWishlists = () => {
  const { copy } = useClipboard()
  const queryClient = useQueryClient()
  const route = useRoute()

  const socket = ref<Socket | null>(null)
  const shareToken = ref<string | null>(null)
  let currentWishlistId: string | null = null

  // Sync shareToken with route.query.share automatically
  watch(
    () => route.query.share as string | undefined,
    (newToken) => {
      shareToken.value = newToken ?? null
    },
    { immediate: true },
  )

  const query = useQuery({
    queryKey: ['shared-wishlist', shareToken],
    queryFn: () => {
      if (!shareToken.value) throw new Error('No share token')

      return wishlistService.getSharedWishlist(shareToken.value)
    },
    enabled: computed(() => !!shareToken.value),
    retry: 1,
    staleTime: Infinity,
  })

  const sharedWishlist = computed(() => query.data.value)

  const sharedWishlistItems = computed(
    () => query.data.value?.wishlistItems || [],
  )

  const sharedWishlistUpdatedAt = computed(() => query.data.value?.updatedAt)

  const isLoadingShared = computed(() => query.isLoading.value)

  const isErrorShared = computed(() => query.isError.value)

  const errorShared = computed(() => query.error.value)

  const connectSocket = (wishlistId: string) => {
    if (socket.value && currentWishlistId === wishlistId) {
      return
    }

    if (socket.value && currentWishlistId && currentWishlistId !== wishlistId) {
      socket.value.emit('leave-wishlist', currentWishlistId)
    }

    if (!socket.value) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const socketUrl = apiUrl.replace(/\/api\/?$/, '')
      socket.value = io(socketUrl)

      socket.value.on('connect', () => {
        if (currentWishlistId) {
          socket.value?.emit('join-wishlist', currentWishlistId)
        }
      })

      socket.value.on(
        'wishlist:updated',
        (updatedWishlist: WishlistWithItems) => {
          queryClient.setQueryData(
            ['shared-wishlist', shareToken.value],
            updatedWishlist,
          )
          toast.info('Wishlist updated')
        },
      )

      socket.value.on('disconnect', () => {})
    }

    currentWishlistId = wishlistId
    if (socket.value.connected) {
      socket.value.emit('join-wishlist', wishlistId)
    }
  }

  watch(
    () => query.data.value?.id,
    (newWishlistId, oldWishlistId) => {
      if (newWishlistId && !!shareToken.value) {
        connectSocket(newWishlistId)
      } else if (!shareToken.value && oldWishlistId) {
        if (socket.value && currentWishlistId) {
          socket.value.emit('leave-wishlist', currentWishlistId)
          currentWishlistId = null
        }
      }
    },
    { immediate: true },
  )

  // Disconnect socket when leaving shared view
  watch(shareToken, (token) => {
    if (!token && socket.value) {
      if (currentWishlistId) {
        socket.value.emit('leave-wishlist', currentWishlistId)
        currentWishlistId = null
      }
      socket.value.disconnect()
      socket.value = null
      queryClient.setQueryData(['shared-wishlist', null], null)
    }
  })

  onUnmounted(() => {
    if (socket.value) {
      if (currentWishlistId) {
        socket.value.emit('leave-wishlist', currentWishlistId)
      }
      socket.value.disconnect()
      socket.value = null
    }
  })

  const shareWishlistMutation = useMutation({
    mutationFn: () => wishlistService.shareWishlist(),
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
      copy(`${window.location.origin}/wishlist?${queryString}`)
      toast.success('Link copied to clipboard')
    },
    onError: (err) => {
      toast.error(err.message || 'Could not create share link')
    },
  })

  const importSharedWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!shareToken.value) throw new Error('No share token')
      return wishlistService.mergeSharedWishlist(shareToken.value)
    },
    onSuccess: (updatedWishlist) => {
      queryClient.setQueryData(['wishlist'], updatedWishlist)
      toast.success('Items imported to your wishlist successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to import shared wishlist')
    },
  })

  const shareWishlist = async () => {
    return shareWishlistMutation.mutateAsync()
  }

  const importSharedWishlist = async () => {
    return importSharedWishlistMutation.mutateAsync()
  }

  const refetchSharedWishlist = () => {
    return query.refetch()
  }

  return {
    // Data
    shareToken,
    sharedWishlist,
    sharedWishlistItems,
    sharedWishlistUpdatedAt,

    // Query states
    isLoadingShared,
    isErrorShared,
    errorShared,
    refetchSharedWishlist,

    // Actions
    shareWishlist,
    importSharedWishlist,

    // Mutation loading states
    isLoadingShareToken: shareWishlistMutation.isPending,
    isImportingSharedWishlist: importSharedWishlistMutation.isPending,
  }
}
