import { adminService } from '@/services/admin.service'
import type {
  AdminCustomerFilters,
  AdminOrderFilters,
  RevenuePeriod,
} from '@/types'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'

/**
 * Dashboard stats composable
 */
export function useDashboardStats() {
  const query = useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    stats: computed(() => query.data.value || null),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Revenue data composable for charts
 */
export function useRevenueData(
  periodRef: MaybeRefOrGetter<RevenuePeriod> = 'month',
) {
  const period = computed(() => toValue(periodRef))

  const query = useQuery({
    queryKey: computed(() => ['admin', 'revenue', period.value]),
    queryFn: () => adminService.getRevenueData(period.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    revenueData: computed(() => query.data.value || []),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Top products composable
 */
export function useTopProducts(limitRef: MaybeRefOrGetter<number> = 10) {
  const limit = computed(() => toValue(limitRef))

  const query = useQuery({
    queryKey: computed(() => ['admin', 'top-products', limit.value]),
    queryFn: () => adminService.getTopProducts(limit.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    topProducts: computed(() => query.data.value || []),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Low stock products composable
 */
export function useLowStockProducts(
  thresholdRef: MaybeRefOrGetter<number> = 10,
) {
  const threshold = computed(() => toValue(thresholdRef))

  const query = useQuery({
    queryKey: computed(() => ['admin', 'low-stock', threshold.value]),
    queryFn: () => adminService.getLowStockProducts(threshold.value),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    lowStockProducts: computed(() => query.data.value || []),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Recent orders composable for dashboard widget
 */
export function useRecentOrders(limitRef: MaybeRefOrGetter<number> = 10) {
  const limit = computed(() => toValue(limitRef))

  const query = useQuery({
    queryKey: computed(() => ['admin', 'recent-orders', limit.value]),
    queryFn: () => adminService.getRecentOrders(limit.value),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    recentOrders: computed(() => query.data.value || []),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Admin customers composable with pagination
 */
export function useAdminCustomers() {
  const filters = ref<AdminCustomerFilters>({
    page: 1,
    limit: 20,
  })

  const query = useQuery({
    queryKey: computed(() => ['admin', 'customers', filters.value]),
    queryFn: () => adminService.getCustomers(filters.value),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  function setPage(page: number) {
    filters.value = { ...filters.value, page }
  }

  function setLimit(limit: number) {
    filters.value = { ...filters.value, limit, page: 1 }
  }

  return {
    customers: computed(() => query.data.value?.customers || []),
    pagination: computed(() => query.data.value?.pagination || null),
    filters,
    setPage,
    setLimit,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Admin orders composable with pagination and filters
 */
export function useAdminOrders() {
  const filters = ref<AdminOrderFilters>({
    page: 1,
    limit: 20,
    status: undefined,
    search: undefined,
  })

  const query = useQuery({
    queryKey: computed(() => ['admin', 'orders', filters.value]),
    queryFn: () => adminService.getOrders(filters.value),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  function setPage(page: number) {
    filters.value = { ...filters.value, page }
  }

  function setLimit(limit: number) {
    filters.value = { ...filters.value, limit, page: 1 }
  }

  function setStatus(status: AdminOrderFilters['status']) {
    filters.value = { ...filters.value, status, page: 1 }
  }

  function setSearch(search: string | undefined) {
    filters.value = { ...filters.value, search, page: 1 }
  }

  function resetFilters() {
    filters.value = {
      page: 1,
      limit: 20,
      status: undefined,
      search: undefined,
    }
  }

  return {
    orders: computed(() => query.data.value?.orders || []),
    pagination: computed(() => query.data.value?.pagination || null),
    filters,
    setPage,
    setLimit,
    setStatus,
    setSearch,
    resetFilters,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
