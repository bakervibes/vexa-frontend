import type { ProductsResponse, ProductWithDetails } from '@/types'
import { api } from '@/utils/api'
import type {
  CreateProductInput,
  FilterInput,
  UpdateProductInput,
} from '@/validators/products.validator'

export const productsService = {
  async getAll(filters?: Partial<FilterInput>) {
    const params = new URLSearchParams()
    if (filters) {
      // Map frontend filters to backend format
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (
        filters.categories &&
        filters.categories.length > 0 &&
        filters.categories[0]
      ) {
        // Backend expects categorySlug as single value, use first category
        params.append('categorySlug', filters.categories[0])
      }
      if (filters.priceRange) {
        if (filters.priceRange.min !== undefined) {
          params.append('minPrice', String(filters.priceRange.min))
        }
        if (filters.priceRange.max !== undefined) {
          params.append('maxPrice', String(filters.priceRange.max))
        }
      }
      if (filters.page) {
        params.append('page', String(filters.page))
      }
      if (filters.sortBy) {
        // Map sortBy + sortOrder to backend sortBy format
        const sortOrder = filters.sortOrder || 'asc'
        if (filters.sortBy === 'price') {
          params.append(
            'sortBy',
            sortOrder === 'asc' ? 'price_asc' : 'price_desc',
          )
        } else if (filters.sortBy === 'createdAt') {
          params.append('sortBy', 'newest')
        } else if (filters.sortBy === 'name') {
          params.append('sortBy', 'name')
        }
      }
      // Handle options filter - encode as JSON for complex objects
      if (filters.options && filters.options.length > 0) {
        params.append('options', JSON.stringify(filters.options))
      }
    }
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return api<ProductsResponse>(`/products${queryString}`, 'GET')
  },

  async getOne(slug: string) {
    return api<ProductWithDetails>(`/products/${slug}`, 'GET')
  },

  async getByCategory(categorySlug: string, query?: Partial<FilterInput>) {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)))
          } else {
            params.append(key, String(value))
          }
        }
      })
    }

    const queryString = params.toString() ? `?${params.toString()}` : ''

    return api<ProductsResponse>(
      `/products/category/${categorySlug}${queryString}`,
      'GET',
    )
  },

  async getFeatured() {
    return api<ProductWithDetails[]>(`/products/featured`, 'GET')
  },

  async getRelated(slug: string) {
    return api<ProductWithDetails[]>(`/products/${slug}/related`, 'GET')
  },

  async getRecentDiscount() {
    return api<ProductWithDetails>('/products/recent-discount', 'GET')
  },

  async create(data: CreateProductInput) {
    return api<ProductWithDetails>('/products', 'POST', data)
  },

  async update(id: string, data: UpdateProductInput) {
    return api<ProductWithDetails>(`/products/${id}`, 'PATCH', data)
  },

  async remove(id: string) {
    return api<ProductWithDetails>(`/products/${id}`, 'DELETE')
  },
}
