import { api } from '@/utils/api'

export interface RefundRequest {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  itemsCount: number
  customer: {
    id: string
    name: string
    email: string
  }
  paymentStatus: string
  createdAt: string
  updatedAt: string
}

export interface RefundsResponse {
  refunds: RefundRequest[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface RefundStats {
  pending: number
  approved: number
  totalRefunded: number
}

export interface RefundFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'processed'
}

export const refundsService = {
  async getRefunds(filters: RefundFilters = {}) {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    if (filters.status) params.append('status', filters.status)
    const query = params.toString() ? `?${params.toString()}` : ''
    return api<RefundsResponse>(`/admin/refunds${query}`, 'GET')
  },

  async getStats() {
    return api<RefundStats>('/admin/refunds/stats', 'GET')
  },

  async approveRefund(orderId: string) {
    return api<{
      id: string
      orderNumber: string
      status: string
      message: string
    }>(`/admin/refunds/${orderId}/approve`, 'POST')
  },

  async rejectRefund(orderId: string, reason?: string) {
    return api<{
      id: string
      orderNumber: string
      status: string
      reason?: string
      message: string
    }>(`/admin/refunds/${orderId}/reject`, 'POST', { reason })
  },
}
