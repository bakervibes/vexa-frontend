import { filtersService } from '@/services/filters.service'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

/**
 * Composable to fetch all available filters for the shop
 * Returns categories, attributes with options, and price range
 */
export function useFilters() {
  const query = useQuery({
    queryKey: ['filters'],
    queryFn: () => filtersService.getFilters(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  })

  return {
    // Categories
    categories: computed(() => query.data.value?.categories || []),

    // Attributes with their options
    attributes: computed(() => query.data.value?.attributes || []),

    // Price range (min/max)
    priceRange: computed(
      () =>
        query.data.value?.priceRange || {
          min: 0,
          max: 0,
        },
    ),

    // Loading/error states
    isLoadingFilters: computed(() => query.isLoading.value),
    isErrorFilters: computed(() => query.isError.value),
    refetchFilters: query.refetch,
  }
}
