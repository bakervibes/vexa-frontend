import { api } from '@/utils/api'

export interface StockMovement {
  id: string
  productId: string
  variantId: string | null
  type: string
  quantity: number
  reason: string
  reference: string | null
  userId: string | null
  note: string | null
  previousStock: number
  newStock: number
  createdAt: string
}

export interface StockMovementsResponse {
  data: StockMovement[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface ProductStockSummary {
  product: {
    id: string
    name: string
    stock: number
    totalVariantStock: number
  }
  variants: {
    id: string
    stock: number
    options: {
      attribute: string
      value: string
    }[]
  }[]
  recentMovements: StockMovement[]
}

export interface StockAdjustmentInput {
  productId: string
  variantId?: string
  newStock: number
  reason: 'MANUAL_ADJUSTMENT' | 'INVENTORY_COUNT' | 'DAMAGED_GOODS' | 'OTHER'
  note?: string
}

export const stockService = {
  /**
   * Ajuster le stock d'un produit
   */
  async adjustStock(data: StockAdjustmentInput): Promise<StockMovement> {
    return api<StockMovement>('/admin/stock/adjust', 'POST', data)
  },

  /**
   * Ajustement en masse du stock
   */
  async bulkAdjustStock(
    adjustments: Array<{
      productId: string
      variantId?: string
      newStock: number
    }>,
    reason?: string,
    note?: string,
  ): Promise<{ success: boolean; movements: StockMovement[] }> {
    return api('/admin/stock/bulk-adjust', 'POST', {
      adjustments,
      reason,
      note,
    })
  },

  /**
   * Obtenir l'historique des mouvements de stock
   */
  async getMovements(params?: {
    productId?: string
    variantId?: string
    type?: string
    reason?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<StockMovementsResponse> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.set(key, String(value))
      })
    }
    const queryString = searchParams.toString()
    return api<StockMovementsResponse>(
      `/admin/stock/movements${queryString ? `?${queryString}` : ''}`,
      'GET',
    )
  },

  /**
   * Obtenir le résumé de stock d'un produit
   */
  async getProductStockSummary(
    productId: string,
  ): Promise<ProductStockSummary> {
    return api<ProductStockSummary>(`/admin/stock/${productId}`, 'GET')
  },
}
