import { api } from '@/utils/api'

export interface SearchResult {
  id: string
  name: string
  slug: string
  description: string | null
  images: string[]
  basePrice: number | null
  price: number | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  averageRating: number
  reviewCount: number
}

export interface SearchResponse {
  data: SearchResult[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
  query: string
}

export interface SearchSuggestion {
  type: 'product' | 'category'
  id: string
  name: string
  slug: string
  image?: string | null
}

export interface InstantSearchResponse {
  products: {
    id: string
    name: string
    slug: string
    images: string[]
    price: number | null
    basePrice: number | null
    category: {
      name: string
      slug: string
    } | null
  }[]
  categories: {
    id: string
    name: string
    slug: string
    image: string
  }[]
}

export interface SearchFilters {
  q: string
  limit?: number
  offset?: number
  categoryId?: string
  minPrice?: number
  maxPrice?: number
}

export const searchService = {
  /**
   * Recherche de produits avec filtres
   */
  async search(filters: SearchFilters): Promise<SearchResponse> {
    const params = new URLSearchParams()
    params.set('q', filters.q)
    if (filters.limit) params.set('limit', String(filters.limit))
    if (filters.offset) params.set('offset', String(filters.offset))
    if (filters.categoryId) params.set('categoryId', filters.categoryId)
    if (filters.minPrice !== undefined)
      params.set('minPrice', String(filters.minPrice))
    if (filters.maxPrice !== undefined)
      params.set('maxPrice', String(filters.maxPrice))

    return api<SearchResponse>(`/search?${params.toString()}`, 'GET')
  },

  /**
   * Suggestions de recherche (autocomplete)
   */
  async getSuggestions(query: string, limit = 10): Promise<SearchSuggestion[]> {
    const params = new URLSearchParams()
    params.set('q', query)
    params.set('limit', String(limit))

    return api<SearchSuggestion[]>(
      `/search/suggestions?${params.toString()}`,
      'GET',
    )
  },

  /**
   * Recherches populaires
   */
  async getPopularSearches(limit = 10): Promise<string[]> {
    return api<string[]>(`/search/popular?limit=${limit}`, 'GET')
  },

  /**
   * Recherche instantanée (pour le modal)
   */
  async instantSearch(query: string): Promise<InstantSearchResponse> {
    return api<InstantSearchResponse>(
      `/search/instant?q=${encodeURIComponent(query)}`,
      'GET',
    )
  },
}
