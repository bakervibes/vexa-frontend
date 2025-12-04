import { productsService } from '@/services/products.service'
import type { SortBy, SortOrder } from '@/validators/common.schemas'
import type {
  CreateProductInput,
  FilterInput,
  UpdateProductInput,
} from '@/validators/products.validator'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue, watch } from 'vue'
import {
  useRoute,
  useRouter,
  type LocationQuery,
  type LocationQueryValue,
} from 'vue-router'
import { toast } from 'vue-sonner'

/**
 * Known filter keys that are not attribute-option pairs
 */
const KNOWN_FILTER_KEYS = [
  'search',
  'categories',
  'minPrice',
  'maxPrice',
  'page',
  'sortBy',
  'sortOrder',
]

export const parseQueryParam = <
  T = string | string[] | SortBy | SortOrder | undefined,
>(
  value: LocationQueryValue | LocationQueryValue[] | undefined,
): T => {
  if (Array.isArray(value)) return value.map((v) => v?.toString() ?? '') as T

  if (typeof value === 'string') return value as T

  return undefined as T
}

/**
 * Parse array query parameters (always returns an array or undefined)
 * Handles both single values and arrays from URL
 */
export const parseArrayQueryParam = (
  value: LocationQueryValue | LocationQueryValue[] | undefined,
): string[] | undefined => {
  if (!value) return undefined

  if (Array.isArray(value))
    return value.filter((v): v is string => v !== null && v !== '')

  return [value]
}

/**
 * Parse options from query params
 * Any key that is not in KNOWN_FILTER_KEYS is considered as an attribute name
 * Format: ?Marque=Apple&Marque=Samsung&Poids=5-10kg
 * Returns: [{Marque: "Apple"}, {Marque: "Samsung"}, {Poids: "5-10kg"}]
 */
export const parseOptionsFromQuery = (
  query: LocationQuery,
): Record<string, string>[] | undefined => {
  const options: Record<string, string>[] = []

  for (const [key, value] of Object.entries(query)) {
    if (KNOWN_FILTER_KEYS.includes(key) || !value) continue

    // Handle multiple values for the same attribute (array)
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v) options.push({ [key]: v })
      }
    } else {
      options.push({ [key]: value })
    }
  }

  return options.length > 0 ? options : undefined
}

/**
 * Convert options array to query params for URL
 * [{Marque: "Apple"}, {Marque: "Samsung"}] => {Marque: ["Apple", "Samsung"]}
 */
export const optionsToQueryParams = (
  options: Record<string, string>[] | undefined,
): Record<string, string | string[]> => {
  if (!options || options.length === 0) return {}

  // Group options by attribute name using Map for type safety
  const grouped = new Map<string, string[]>()

  for (const option of options) {
    for (const key of Object.keys(option)) {
      const value = option[key]
      if (value === undefined) continue

      const existing = grouped.get(key)
      if (existing) {
        existing.push(value)
      } else {
        grouped.set(key, [value])
      }
    }
  }

  // Convert single-item arrays to strings for cleaner URLs
  const result: Record<string, string | string[]> = {}
  grouped.forEach((values, key) => {
    if (values.length === 1 && values[0] !== undefined) {
      result[key] = values[0]
    } else {
      result[key] = values
    }
  })

  return result
}

// Shared filters state across all useProducts() calls
const filters = ref<FilterInput>({
  page: undefined,
  sortBy: undefined,
  sortOrder: undefined,
  priceRange: undefined,
  search: undefined,
  categories: undefined,
  options: undefined,
})

let watcherInitialized = false

/**
 * Composable to fetch all products with filters
 */
export function useProducts() {
  const router = useRouter()
  const route = useRoute()

  if (!watcherInitialized) {
    watch(
      () => route.query,
      (q) => {
        // Parse minPrice and maxPrice from URL and convert to priceRange object
        const minPriceStr = parseQueryParam<string | undefined>(q.minPrice)
        const maxPriceStr = parseQueryParam<string | undefined>(q.maxPrice)
        const minPrice = minPriceStr ? Number(minPriceStr) : undefined
        const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined

        filters.value = {
          page: parseQueryParam(q.page),
          sortBy: parseQueryParam(q.sortBy),
          sortOrder: parseQueryParam(q.sortOrder),
          priceRange:
            minPrice !== undefined || maxPrice !== undefined
              ? { min: minPrice, max: maxPrice }
              : undefined,
          search: parseQueryParam(q.search),
          categories: parseArrayQueryParam(q.categories),
          options: parseOptionsFromQuery(q),
        }
      },
      { immediate: true },
    )
    watcherInitialized = true
  }

  const query = useQuery({
    queryKey: computed(() => ['products', { ...filters.value }]),
    queryFn: () => productsService.getAll(filters.value),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  function setFilters(newFilters: Partial<FilterInput>, resetPage = true) {
    filters.value = {
      ...filters.value,
      ...(resetPage && { page: '1' }),
      ...newFilters,
    }

    // Build URL query: separate known params from options and convert priceRange to minPrice/maxPrice
    const { options, priceRange, ...knownFilters } = filters.value
    const optionsParams = optionsToQueryParams(options)

    // Convert priceRange object to URL params (minPrice/maxPrice)
    const priceParams: Record<string, string | undefined> = {}
    if (priceRange?.min !== undefined) {
      priceParams.minPrice = String(priceRange.min)
    }
    if (priceRange?.max !== undefined) {
      priceParams.maxPrice = String(priceRange.max)
    }

    router.replace({
      query: { ...knownFilters, ...priceParams, ...optionsParams },
    })
  }

  function resetFilters() {
    filters.value = {
      page: '1',
      sortBy: undefined,
      sortOrder: undefined,
      priceRange: undefined,
      search: undefined,
      categories: undefined,
      options: undefined,
    }
  }

  return {
    products: computed(() => query.data.value?.products || []),
    paginationProducts: computed(() => query.data.value?.pagination),
    isLoadingProducts: computed(() => query.isLoading.value),
    isErrorProducts: computed(() => query.isError.value),
    refetchProducts: query.refetch,
    filters,
    setFilters,
    resetFilters,
  }
}

/**
 * Composable to fetch featured products
 */
export function useFeaturedProducts() {
  const query = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsService.getFeatured(),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  })

  return {
    featuredProducts: computed(() => query.data.value || []),
    isLoadingFeaturedProducts: computed(() => query.isLoading.value),
    isErrorFeaturedProducts: computed(() => query.isError.value),
    refetchFeaturedProducts: query.refetch,
  }
}

/**
 * Composable to fetch related products
 */
export function useRelatedProducts(slug: MaybeRefOrGetter<string>) {
  const query = useQuery({
    queryKey: computed(() => ['products', 'related', toValue(slug)]),
    queryFn: () => productsService.getRelated(toValue(slug)),
    staleTime: 1000 * 60 * 10,
    retry: 1,
    enabled: computed(() => !!toValue(slug)),
  })

  return {
    relatedProducts: computed(() => query.data.value || []),
    isLoadingRelatedProducts: computed(() => query.isLoading.value),
    isErrorRelatedProducts: computed(() => query.isError.value),
    refetchRelatedProducts: query.refetch,
  }
}

/**
 * Composable to fetch the most recent discounted product
 */
export function useRecentDiscountProduct() {
  const query = useQuery({
    queryKey: ['products', 'recent-discount'],
    queryFn: () => productsService.getRecentDiscount(),
    staleTime: 1000 * 60 * 10,
    retry: 1,
  })

  return {
    recentDiscountProduct: computed(() => query.data.value || null),
    isLoadingRecentDiscountProduct: computed(() => query.isLoading.value),
    isErrorRecentDiscountProduct: computed(() => query.isError.value),
    refetchRecentDiscountProduct: query.refetch,
  }
}

/**
 * Composable to fetch a product by its slug
 */
export function useProduct(slug: MaybeRefOrGetter<string>) {
  const query = useQuery({
    queryKey: computed(() => ['products', toValue(slug)]),
    queryFn: () => productsService.getOne(toValue(slug)),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: computed(() => !!toValue(slug)),
  })

  return {
    product: computed(() => query.data.value || null),
    isLoadingProduct: computed(() => query.isLoading.value),
    isErrorProduct: computed(() => query.isError.value),
    refetchProduct: query.refetch,
  }
}

export const useProductsMutation = () => {
  const queryClient = useQueryClient()

  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductInput) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully !')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error creating product')
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: (data: { id: string; payload: UpdateProductInput }) =>
      productsService.update(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error updating product')
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product deleted successfully !')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error deleting product')
    },
  })

  // ========================================
  // Actions
  // ========================================

  function createProduct(data: CreateProductInput) {
    return createProductMutation.mutateAsync(data)
  }

  function updateProduct(id: string, payload: UpdateProductInput) {
    return updateProductMutation.mutateAsync({ id, payload })
  }

  function deleteProduct(id: string) {
    return deleteProductMutation.mutateAsync(id)
  }

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    isCreatingProduct: computed(() => createProductMutation.isPending.value),
    isUpdatingProduct: computed(() => updateProductMutation.isPending.value),
    isDeletingProduct: computed(() => deleteProductMutation.isPending.value),
  }
}
