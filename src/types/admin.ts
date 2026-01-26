import type { OrderStatus } from './models'

/**
 * Dashboard KPIs
 */
export interface DashboardStats {
  revenue: {
    today: number
    week: number
    month: number
    total: number
  }
  orders: {
    total: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  customers: {
    total: number
    newThisMonth: number
    active: number
  }
  products: {
    total: number
    lowStock: number
    outOfStock: number
  }
}

/**
 * Revenue data point for charts
 */
export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
}

/**
 * Top product data
 */
export interface TopProduct {
  id: string
  name: string
  slug: string
  image: string
  totalSold: number
  revenue: number
}

/**
 * Low stock product
 */
export interface LowStockProduct {
  id: string
  name: string
  slug: string
  image: string
  stock: number
  category: string
}

/**
 * Recent order for dashboard
 */
export interface RecentOrder {
  id: string
  orderNumber: string
  customer: {
    id: string
    name: string
    email: string
    image: string | null
  }
  totalAmount: number
  status: OrderStatus
  createdAt: string
}

/**
 * Admin customer with stats
 */
export interface AdminCustomer {
  id: string
  name: string
  email: string
  phone: string | null
  image: string | null
  isActive: boolean
  createdAt: string
  ordersCount: number
  totalSpent: number
}

/**
 * Admin order with details
 */
export interface AdminOrder {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  totalAmount: number
  subtotalAmount: number
  shippingCost: number
  discountAmount: number
  shippingType: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    image: string | null
  }
  itemsCount: number
  payments: Array<{
    id: string
    status: string
    provider: string
  }>
}

/**
 * Pagination info
 */
export interface AdminPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Paginated customers response
 */
export interface AdminCustomersResponse {
  customers: AdminCustomer[]
  pagination: AdminPagination
}

/**
 * Paginated orders response
 */
export interface AdminOrdersResponse {
  orders: AdminOrder[]
  pagination: AdminPagination
}

/**
 * Revenue period type
 */
export type RevenuePeriod = 'week' | 'month' | 'year'

/**
 * Order filters for admin
 */
export interface AdminOrderFilters {
  page?: number
  limit?: number
  status?: OrderStatus
  search?: string
}

/**
 * Customer filters for admin
 */
export interface AdminCustomerFilters {
  page?: number
  limit?: number
}
