import type { OrderDetails, UserOrder } from '@/types'
import { api } from '@/utils/api'
import type { CreateOrderInput } from '@/validators/orders.validator'

export type { CreateOrderInput }

export const orderService = {
  async createOrder(data: CreateOrderInput) {
    return api<UserOrder>('/orders', 'POST', data)
  },

  async getUserOrders() {
    return api<UserOrder[]>('/orders/me', 'GET')
  },

  async getOrderById(id: string) {
    return api<OrderDetails>(`/orders/${id}`, 'GET')
  },

  async getOrderByNumber(orderNumber: string) {
    return api<OrderDetails>(`/orders/number/${orderNumber}`, 'GET')
  },

  async cancelOrder(id: string) {
    return api<UserOrder>(`/orders/${id}/cancel`, 'PATCH')
  },
}
