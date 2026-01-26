import type {
  AdminCustomerFilters,
  AdminCustomersResponse,
  AdminOrder,
  AdminOrderFilters,
  AdminOrdersResponse,
  AdminPagination,
  DashboardStats,
  LowStockProduct,
  RecentOrder,
  RevenueDataPoint,
  RevenuePeriod,
  TopProduct,
} from '@/types'
import { api } from '@/utils/api'

export const adminService = {
  /**
   * Get dashboard KPIs
   */
  async getDashboardStats() {
    return api<DashboardStats>('/admin/stats/dashboard', 'GET')
  },

  /**
   * Get revenue data for charts
   */
  async getRevenueData(period: RevenuePeriod = 'month') {
    return api<RevenueDataPoint[]>(
      `/admin/stats/revenue?period=${period}`,
      'GET',
    )
  },

  /**
   * Get top selling products
   */
  async getTopProducts(limit = 10) {
    return api<TopProduct[]>(`/admin/stats/top-products?limit=${limit}`, 'GET')
  },

  /**
   * Get low stock products
   */
  async getLowStockProducts(threshold = 10) {
    return api<LowStockProduct[]>(
      `/admin/stats/low-stock?threshold=${threshold}`,
      'GET',
    )
  },

  /**
   * Get recent orders for dashboard widget
   */
  async getRecentOrders(limit = 10) {
    return api<RecentOrder[]>(`/admin/orders/recent?limit=${limit}`, 'GET')
  },

  /**
   * Get all customers with pagination
   */
  async getCustomers(filters?: AdminCustomerFilters) {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return api<AdminCustomersResponse>(`/admin/customers${queryString}`, 'GET')
  },

  /**
   * Get all orders with pagination and filters
   */
  async getOrders(filters?: AdminOrderFilters) {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', String(filters.page))
    if (filters?.limit) params.append('limit', String(filters.limit))
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    const queryString = params.toString() ? `?${params.toString()}` : ''

    // Backend returns { data, meta } - map to { orders, pagination }
    const response = await api<{ data: AdminOrder[]; meta: AdminPagination }>(
      `/orders${queryString}`,
      'GET',
    )
    return {
      orders: response.data,
      pagination: response.meta,
    }
  },

  /**
   * Get customer detail with orders history
   */
  async getCustomerDetail(id: string) {
    return api<CustomerDetailResponse>(`/admin/customers/${id}`, 'GET')
  },
}

export interface CustomerDetailResponse {
  customer: {
    id: string
    name: string
    email: string
    phone: string | null
    image: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  stats: {
    totalOrders: number
    totalReviews: number
    totalSpent: number
    averageOrderValue: number
  }
  addresses: {
    id: string
    name: string
    phone: string
    street: string
    city: string
    country: string
    isDefault: boolean
  }[]
  orders: {
    id: string
    orderNumber: string
    status: string
    totalAmount: number
    itemsCount: number
    createdAt: string
    paymentStatus: string
  }[]
}
