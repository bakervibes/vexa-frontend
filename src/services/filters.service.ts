import type { FiltersResponse } from '@/types'
import { api } from '@/utils/api'

export const filtersService = {
  /**
   * Get all available filters (categories, attributes with options, price range)
   */
  async getFilters() {
    return api<FiltersResponse>('/filters', 'GET')
  },
}
