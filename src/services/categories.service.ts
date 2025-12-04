import type { Category, CategoryWithChildren } from '@/types'
import { api } from '@/utils/api'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/validators/categories.validator'

export const categoriesService = {
  async getAll() {
    return api<CategoryWithChildren[]>('/categories', 'GET')
  },

  async getOne(slug: string) {
    return api<CategoryWithChildren>(`/categories/${slug}`, 'GET')
  },

  async getBestSelling() {
    return api<CategoryWithChildren[]>('/categories/best-selling', 'GET')
  },

  async create(data: CreateCategoryInput) {
    return api<Category>('/categories', 'POST', data)
  },

  async update(id: string, data: UpdateCategoryInput) {
    return api<Category>(`/categories/${id}`, 'PATCH', data)
  },

  async remove(id: string) {
    return api<Category>(`/categories/${id}`, 'DELETE')
  },
}
