import { orderService } from '@/services/orders.service'
import type { UserOrder } from '@/types'
import type { CreateOrderInput } from '@/validators/orders.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Composable pour récupérer les commandes de l'utilisateur
 */
export function useUserOrders() {
  const query = useQuery({
    queryKey: ['orders', 'user'],
    queryFn: () => orderService.getUserOrders(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  return {
    orders: computed(() => query.data.value || []),
    isLoading: computed(() => query.isLoading.value),
    isError: computed(() => query.isError.value),
    error: computed(() => query.error.value),
    refetch: query.refetch,
  }
}

/**
 * Composable pour récupérer une commande par son numéro
 */
export function useOrder(orderNumber: Ref<string | null | undefined>) {
  const query = useQuery({
    queryKey: ['orders', 'number', orderNumber],
    queryFn: () => {
      if (!orderNumber.value) {
        throw new Error('Order number is required !')
      }
      return orderService.getOrderByNumber(orderNumber.value)
    },
    enabled: computed(() => !!orderNumber.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  return {
    order: computed(() => query.data.value),
    isLoading: computed(() => query.isLoading.value),
    isError: computed(() => query.isError.value),
    error: computed(() => query.error.value),
    refetch: query.refetch,
  }
}

/**
 * Composable pour récupérer une commande par son ID
 */
export function useOrderById(orderId: Ref<string | null | undefined>) {
  const query = useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => {
      if (!orderId.value) {
        throw new Error('Order ID is required !')
      }
      return orderService.getOrderById(orderId.value)
    },
    enabled: computed(() => !!orderId.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  return {
    order: computed(() => query.data.value),
    isLoading: computed(() => query.isLoading.value),
    isError: computed(() => query.isError.value),
    error: computed(() => query.error.value),
    refetch: query.refetch,
  }
}

/**
 * Composable pour les mutations de commandes (création, annulation)
 */
export function useOrdersMutation() {
  const queryClient = useQueryClient()

  // Mutation pour créer une commande
  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderInput) => orderService.createOrder(data),
    onSuccess: (order) => {
      // Invalider les queries du panier et des commandes
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order placed successfully !')
      return order
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order !')
    },
  })

  // Mutation pour annuler une commande
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order cancelled successfully !')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order !')
    },
  })

  /**
   * Créer une nouvelle commande
   */
  async function createOrder(data: CreateOrderInput): Promise<UserOrder> {
    return createOrderMutation.mutateAsync(data)
  }

  /**
   * Annuler une commande
   */
  async function cancelOrder(orderId: string): Promise<UserOrder> {
    return cancelOrderMutation.mutateAsync(orderId)
  }

  return {
    // Actions
    createOrder,
    cancelOrder,

    // Loading states
    isCreatingOrder: computed(() => createOrderMutation.isPending.value),
    isCancellingOrder: computed(() => cancelOrderMutation.isPending.value),

    // Error states
    createOrderError: computed(() => createOrderMutation.error.value),
    cancelOrderError: computed(() => cancelOrderMutation.error.value),

    // Data from last mutation
    createdOrder: computed(() => createOrderMutation.data.value),
  }
}
