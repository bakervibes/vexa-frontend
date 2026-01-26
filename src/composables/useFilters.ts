import { filtersService } from '@/services/filters.service'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

/**
 * Hook to fetch all available filters for the shop
 * Returns categories, attributes with options, and price range
 */
export const useFilters = () => {
  const query = useQuery({
    queryKey: ['filters'],
    queryFn: () => filtersService.getFilters(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  })

  // ========================================
  // Computed
  // ========================================
  const categories = computed(() => query.data.value?.categories || [])
  const attributes = computed(() => query.data.value?.attributes || [])
  const priceRange = computed(
    () =>
      query.data.value?.priceRange || {
        min: 0,
        max: 0,
      },
  )

  const isLoadingFilters = computed(() => query.isLoading.value)
  const isErrorFilters = computed(() => query.isError.value)

  // ========================================
  // Actions
  // ========================================
  function refetchFilters() {
    return query.refetch()
  }

  return {
    // Categories
    categories,

    // Attributes with their options
    attributes,

    // Price range (min/max)
    priceRange,

    // Loading/error states
    isLoadingFilters,
    isErrorFilters,
    refetchFilters,
  }
}
