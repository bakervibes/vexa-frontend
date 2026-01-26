import { productsService } from '@/services/products.service'
import type { SortBy, SortOrder } from '@/validators/common.schemas'
import type {
  CreateProductInput,
  FilterInput,
  UpdateProductInput,
} from '@/validators/products.validator'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import {
  useRoute,
  useRouter,
  type LocationQuery,
  type LocationQueryValue,
} from 'vue-router'
import { toast } from 'vue-sonner'

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

export const parseArrayQueryParam = (
  value: LocationQueryValue | LocationQueryValue[] | undefined,
): string[] | undefined => {
  if (!value) return undefined
  if (Array.isArray(value))
    return value.filter((v): v is string => v !== null && v !== '')
  return [value]
}

export const parseOptionsFromQuery = (
  query: LocationQuery,
): Record<string, string>[] | undefined => {
  const options: Record<string, string>[] = []
  for (const [key, value] of Object.entries(query)) {
    if (KNOWN_FILTER_KEYS.includes(key) || !value) continue
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

export const optionsToQueryParams = (
  options: Record<string, string>[] | undefined,
): Record<string, string | string[]> => {
  if (!options || options.length === 0) return {}
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

export const useProducts = () => {
  const router = useRouter()
  const route = useRoute()
  const queryClient = useQueryClient()

  const filters = ref<FilterInput>({
    page: undefined,
    sortBy: undefined,
    sortOrder: undefined,
    priceRange: undefined,
    search: undefined,
    categories: undefined,
    options: undefined,
  })

  // Synchroniser les filtres depuis l'URL
  watch(
    () => route.query,
    (q) => {
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

  // CORRECTION PRINCIPALE : rendre filtersWithoutPage réactif via computed
  const filtersWithoutPage = computed(() => {
    const { page: _page, ...rest } = filters.value
    return rest
  })

  const productsQuery = useInfiniteQuery({
    queryKey: computed(() => ['products', filtersWithoutPage.value]),
    queryFn: ({ pageParam }: { pageParam: unknown }) =>
      productsService.getAll({
        ...filters.value,
        page: String(pageParam as number),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: {
      meta: { page: number; totalPages: number; hasMore: boolean }
    }) => {
      if (lastPage.meta.hasMore) {
        return lastPage.meta.page + 1
      }
      return undefined
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductInput) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product created successfully!')
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
      toast.success('Product deleted successfully!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Error deleting product')
    },
  })

  const products = computed(
    () => productsQuery.data.value?.pages.flatMap((page) => page.data) || [],
  )

  const paginationProducts = computed(
    () => productsQuery.data.value?.pages[0]?.meta,
  )

  const isLoadingProducts = computed(() => productsQuery.isLoading.value)

  const isErrorProducts = computed(() => productsQuery.isError.value)

  function setFilters(newFilters: Partial<FilterInput>, _resetPage = true) {
    const { options, priceRange, ...knownFilters } = {
      ...filters.value,
      ...newFilters,
    }
    const { page: _page, ...filtersWithoutPageValue } = knownFilters

    const optionsParams = optionsToQueryParams(options)
    const priceParams: Record<string, string | undefined> = {}
    if (priceRange?.min !== undefined)
      priceParams.minPrice = String(priceRange.min)
    if (priceRange?.max !== undefined)
      priceParams.maxPrice = String(priceRange.max)

    // Mettre à jour l'URL (sans page pour infinite scroll)
    router.replace({
      query: {
        ...filtersWithoutPageValue,
        ...priceParams,
        ...optionsParams,
      },
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
    router.replace({ query: {} })
  }

  function refetchProducts() {
    return productsQuery.refetch()
  }

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
    filters,
    setFilters,
    resetFilters,

    products,
    paginationProducts,
    isLoadingProducts,
    isErrorProducts,
    refetchProducts,

    fetchNextPage: productsQuery.fetchNextPage,
    hasNextPage: productsQuery.hasNextPage,
    isFetchingNextPage: productsQuery.isFetchingNextPage,

    createProduct,
    updateProduct,
    deleteProduct,
    isCreatingProduct: computed(() => createProductMutation.isPending.value),
    isUpdatingProduct: computed(() => updateProductMutation.isPending.value),
    isDeletingProduct: computed(() => deleteProductMutation.isPending.value),
  }
}

export function useProduct(
  slugRef: MaybeRefOrGetter<string | null | undefined>,
) {
  const slug = computed(() => toValue(slugRef))

  const query = useQuery({
    queryKey: computed(() => ['products', slug.value]),
    queryFn: () => productsService.getOne(slug.value!),
    enabled: computed(() => !!slug.value),
    staleTime: 1000 * 60 * 5,
  })

  return {
    product: computed(() => query.data.value || null),
    isLoadingProduct: query.isLoading,
    isErrorProduct: query.isError,
    refetchProduct: query.refetch,
  }
}

export function useRelatedProducts(
  slugRef: MaybeRefOrGetter<string | null | undefined>,
) {
  const slug = computed(() => toValue(slugRef))

  const query = useQuery({
    queryKey: computed(() => ['products', 'related-products', slug.value]),
    queryFn: () => productsService.getRelated(slug.value!),
    enabled: computed(() => !!slug.value),
    staleTime: 1000 * 60 * 10,
  })

  return {
    relatedProducts: computed(() => query.data.value || []),
    isLoadingRelatedProducts: query.isLoading,
    isErrorRelatedProducts: query.isError,
    refetchRelatedProducts: query.refetch,
  }
}

export function useFeaturedProducts() {
  const query = useQuery({
    queryKey: ['products', 'featured-products'],
    queryFn: () => productsService.getFeatured(),
    staleTime: 1000 * 60 * 10,
  })

  return {
    featuredProducts: computed(() => query.data.value || []),
    isLoadingFeaturedProducts: query.isLoading,
    isErrorFeaturedProducts: query.isError,
    refetchFeaturedProducts: query.refetch,
  }
}

export function useRecentDiscountProduct() {
  const query = useQuery({
    queryKey: ['products', 'recent-discount'],
    queryFn: () => productsService.getRecentDiscount(),
    staleTime: 1000 * 60 * 10,
  })

  return {
    recentDiscountProduct: computed(() => query.data.value || null),
    isLoadingRecentDiscountProduct: query.isLoading,
    isErrorRecentDiscountProduct: query.isError,
    refetchRecentDiscountProduct: query.refetch,
  }
}
