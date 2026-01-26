import { api } from '@/utils/api'

export interface AttributeOption {
  id: string
  attributeId?: string
  name: string
  slug: string
  isActive: boolean
  usageCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface Attribute {
  id: string
  name: string
  slug: string
  isActive: boolean
  optionsCount?: number
  options: AttributeOption[]
  createdAt: string
  updatedAt: string
}

export interface CreateAttributeInput {
  name: string
  slug?: string
  isActive?: boolean
}

export interface UpdateAttributeInput {
  name?: string
  slug?: string
  isActive?: boolean
}

export interface CreateOptionInput {
  name: string
  slug?: string
  isActive?: boolean
}

export interface UpdateOptionInput {
  name?: string
  slug?: string
  isActive?: boolean
}

export const attributesService = {
  // Attributes
  async getAll(includeInactive = true) {
    const query = includeInactive ? '?includeInactive=true' : ''
    return api<Attribute[]>(`/admin/attributes${query}`, 'GET')
  },

  async getById(id: string) {
    return api<Attribute>(`/admin/attributes/${id}`, 'GET')
  },

  async create(data: CreateAttributeInput) {
    return api<Attribute>('/admin/attributes', 'POST', data)
  },

  async update(id: string, data: UpdateAttributeInput) {
    return api<Attribute>(`/admin/attributes/${id}`, 'PATCH', data)
  },

  async delete(id: string) {
    return api<{ message: string }>(`/admin/attributes/${id}`, 'DELETE')
  },

  // Options
  async getOptions(attributeId: string) {
    return api<AttributeOption[]>(
      `/admin/attributes/${attributeId}/options`,
      'GET',
    )
  },

  async createOption(attributeId: string, data: CreateOptionInput) {
    return api<AttributeOption>(
      `/admin/attributes/${attributeId}/options`,
      'POST',
      data,
    )
  },

  async updateOption(optionId: string, data: UpdateOptionInput) {
    return api<AttributeOption>(
      `/admin/attributes/options/${optionId}`,
      'PATCH',
      data,
    )
  },

  async deleteOption(optionId: string) {
    return api<{ message: string }>(
      `/admin/attributes/options/${optionId}`,
      'DELETE',
    )
  },
}
