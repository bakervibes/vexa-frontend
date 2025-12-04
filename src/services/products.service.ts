import type { ProductsResponse, ProductWithDetails } from '@/types'
import { api } from '@/utils/api'
import type {
  CreateProductInput,
  FilterInput,
  UpdateProductInput,
} from '@/validators/products.validator'

export const productsService = {
  async getAll(filters?: Partial<FilterInput>) {
    return api<ProductsResponse>('/products', 'POST', filters || {})
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
