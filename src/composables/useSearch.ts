import {
  searchService,
  type InstantSearchResponse,
  type SearchFilters,
  type SearchResponse,
  type SearchSuggestion,
} from '@/services/search.service'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref, watch, type Ref } from 'vue'

/**
 * Composable pour la recherche instantanée (modal)
 */
export function useInstantSearch() {
  const query = ref('')
  const debouncedQuery = ref('')
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // Debounce the query
  watch(query, (newQuery) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedQuery.value = newQuery
    }, 300)
  })

  const { data, isLoading, error } = useQuery({
    queryKey: computed(() => ['instantSearch', debouncedQuery.value]),
    queryFn: () => searchService.instantSearch(debouncedQuery.value),
    enabled: computed(() => debouncedQuery.value.length >= 2),
    staleTime: 1000 * 60, // 1 minute
  })

  const results = computed<InstantSearchResponse>(
    () => data.value || { products: [], categories: [] },
  )
  const hasResults = computed(
    () =>
      results.value.products.length > 0 || results.value.categories.length > 0,
  )

  return {
    query,
    results,
    isLoading,
    hasResults,
    error,
  }
}

/**
 * Composable pour les suggestions de recherche
 */
export function useSearchSuggestions(queryRef: Ref<string>) {
  const debouncedQuery = ref('')
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  watch(queryRef, (newQuery) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedQuery.value = newQuery
    }, 200)
  })

  const { data, isLoading } = useQuery({
    queryKey: computed(() => ['searchSuggestions', debouncedQuery.value]),
    queryFn: () => searchService.getSuggestions(debouncedQuery.value),
    enabled: computed(() => debouncedQuery.value.length >= 2),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const suggestions = computed<SearchSuggestion[]>(() => data.value || [])

  return {
    suggestions,
    isLoading,
  }
}

/**
 * Composable pour les recherches populaires
 */
export function usePopularSearches() {
  const { data, isLoading } = useQuery({
    queryKey: ['popularSearches'],
    queryFn: () => searchService.getPopularSearches(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const searches = computed<string[]>(() => data.value || [])

  return {
    searches,
    isLoading,
  }
}

/**
 * Composable pour la page de résultats de recherche
 */
export function useSearchResults(filters: Ref<SearchFilters>) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: computed(() => ['searchResults', filters.value]),
    queryFn: () => searchService.search(filters.value),
    enabled: computed(() => filters.value.q.length >= 2),
    staleTime: 1000 * 60, // 1 minute
  })

  const results = computed<SearchResponse>(
    () =>
      data.value || {
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false },
        query: '',
      },
  )

  return {
    results,
    isLoading,
    error,
    refetch,
  }
}
