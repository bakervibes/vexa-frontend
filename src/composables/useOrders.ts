import { orderService } from '@/services/orders.service'
import type { OrderDetails } from '@/types'
import type { CreateOrderInput } from '@/validators/orders.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Hook to manage orders state and mutations
 */
export const useOrders = () => {
  const queryClient = useQueryClient()

  const userOrdersQuery = useQuery({
    queryKey: ['orders', 'user'],
    queryFn: () => orderService.getUserOrders(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const createOrderMutation = useMutation({
    mutationFn: (data: CreateOrderInput) => orderService.createOrder(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order placed successfully!')
      return order
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order!')
    },
  })

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order cancelled successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel order!')
    },
  })

  const requestRefundMutation = useMutation({
    mutationFn: (orderId: string) => orderService.requestRefund(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Refund requested successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to request refund!')
    },
  })

  const orders = computed(() => userOrdersQuery.data.value || [])
  const isLoadingOrders = computed(() => userOrdersQuery.isLoading.value)
  const isErrorOrders = computed(() => userOrdersQuery.isError.value)
  const errorOrders = computed(() => userOrdersQuery.error.value)

  function refetchOrders() {
    return userOrdersQuery.refetch()
  }

  async function createOrder(data: CreateOrderInput): Promise<OrderDetails> {
    return createOrderMutation.mutateAsync(data)
  }

  async function cancelOrder(orderId: string): Promise<OrderDetails> {
    return cancelOrderMutation.mutateAsync(orderId)
  }

  return {
    orders,
    isLoadingOrders,
    isErrorOrders,
    errorOrders,
    refetchOrders,

    createOrder,
    cancelOrder,
    requestRefund: (orderId: string) =>
      requestRefundMutation.mutateAsync(orderId),
    isCreatingOrder: computed(() => createOrderMutation.isPending.value),
    isCancellingOrder: computed(() => cancelOrderMutation.isPending.value),
    isRequestingRefund: computed(() => requestRefundMutation.isPending.value),
    createOrderError: computed(() => createOrderMutation.error.value),
    cancelOrderError: computed(() => cancelOrderMutation.error.value),
    requestRefundError: computed(() => requestRefundMutation.error.value),
    createdOrder: computed(() => createOrderMutation.data.value),
  }
}

export function useOrderByNumber(
  orderNumberRef: MaybeRefOrGetter<string | null | undefined>,
) {
  const orderNumber = computed(() => toValue(orderNumberRef))

  const query = useQuery({
    queryKey: computed(() => ['orders', 'number', orderNumber.value]),
    queryFn: () => orderService.getOrderByNumber(orderNumber.value!),
    enabled: computed(() => !!orderNumber.value),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  return {
    order: computed(() => query.data.value),
    isLoadingOrder: query.isLoading,
    isErrorOrder: query.isError,
    errorOrder: query.error,
    refetchOrder: query.refetch,
  }
}

export function useOrderById(
  orderIdRef: MaybeRefOrGetter<string | null | undefined>,
) {
  const orderId = computed(() => toValue(orderIdRef))

  const query = useQuery({
    queryKey: computed(() => ['orders', 'id', orderId.value]),
    queryFn: () => orderService.getOrderById(orderId.value!),
    enabled: computed(() => !!orderId.value),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  return {
    order: computed(() => query.data.value),
    isLoadingOrder: query.isLoading,
    isErrorOrder: query.isError,
    errorOrder: query.error,
    refetchOrder: query.refetch,
  }
}
