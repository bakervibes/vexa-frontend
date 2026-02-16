import type { OrderDetails, OrderStatus } from '@/types'
import { api } from '@/utils/api'
import type { CreateOrderInput } from '@/validators/orders.validator'

export type { CreateOrderInput }

export const orderService = {
  async createOrder(data: CreateOrderInput) {
    return api<OrderDetails>('/orders', 'POST', data)
  },

  async getUserOrders() {
    const response = await api<{ data: OrderDetails[]; meta: unknown }>(
      '/orders/me',
      'GET',
    )
    return response.data
  },

  async getOrderById(id: string) {
    return api<OrderDetails>(`/orders/${id}`, 'GET')
  },

  async getOrderByNumber(orderNumber: string) {
    return api<OrderDetails>(`/orders/number/${orderNumber}`, 'GET')
  },

  async cancelOrder(id: string) {
    return api<OrderDetails>(`/orders/${id}/cancel`, 'PATCH')
  },

  async requestRefund(id: string) {
    return api<OrderDetails>(`/orders/${id}/refund-request`, 'PATCH')
  },

  async downloadInvoice(id: string) {
    return api<Blob>(`/orders/${id}/invoice`, 'GET', undefined, {
      responseType: 'blob',
    })
  },

  // Admin methods
  async getById(id: string) {
    return api<OrderDetails>(`/admin/orders/${id}`, 'GET')
  },

  async updateStatus(id: string, status: OrderStatus) {
    return api<OrderDetails>(`/admin/orders/${id}/status`, 'PATCH', { status })
  },
}

// Alias for backwards compatibility
export const ordersService = orderService
