import { api } from '@/utils/api'

export interface ShippingZone {
  id: string
  name: string
  description: string | null
  countries: string[]
  cities: string[]
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  options?: ShippingOption[]
}

export interface ShippingOption {
  id: string
  shippingZoneId: string
  name: string
  description: string | null
  type: 'STANDARD' | 'EXPRESS' | 'PICKUP'
  price: number
  freeThreshold: number | null
  minOrderAmount: number | null
  delayMinDays: number
  delayMaxDays: number
  codAllowed: boolean
  isActive: boolean
  position: number
  createdAt: string
  updatedAt: string
  zone?: ShippingZone
  // Computed fields from checkout
  finalPrice?: number
  isFreeShipping?: boolean
  deliveryEstimate?: string
}

export interface CheckoutShippingResponse {
  zone: {
    id: string
    name: string
  } | null
  options: ShippingOption[]
  message: string | null
}

export interface CreateZoneInput {
  name: string
  description?: string
  countries: string[]
  cities?: string[]
  isDefault?: boolean
  isActive?: boolean
}

export interface CreateOptionInput {
  shippingZoneId: string
  name: string
  description?: string
  type: 'STANDARD' | 'EXPRESS' | 'PICKUP'
  price: number
  freeThreshold?: number
  minOrderAmount?: number
  delayMinDays: number
  delayMaxDays: number
  codAllowed?: boolean
  isActive?: boolean
  position?: number
}

export const shippingService = {
  // ========================================
  // Public endpoints
  // ========================================

  /**
   * Récupérer les options de livraison pour le checkout
   */
  async getCheckoutOptions(
    country: string,
    city?: string,
    subtotal?: number,
  ): Promise<CheckoutShippingResponse> {
    const params = new URLSearchParams()
    params.set('country', country)
    if (city) params.set('city', city)
    if (subtotal !== undefined) params.set('subtotal', String(subtotal))
    return api<CheckoutShippingResponse>(
      `/shipping/options?${params.toString()}`,
      'GET',
    )
  },

  /**
   * Calculer le coût de livraison
   */
  async calculateCost(
    optionId: string,
    subtotal: number,
  ): Promise<{
    option: ShippingOption
    cost: number
    isFree: boolean
    reason: string | null
  }> {
    return api('/shipping/calculate', 'POST', { optionId, subtotal })
  },

  // ========================================
  // Admin endpoints - Zones
  // ========================================

  /**
   * Récupérer toutes les zones (admin)
   */
  async getAllZones(): Promise<ShippingZone[]> {
    return api<ShippingZone[]>('/admin/shipping/zones', 'GET')
  },

  /**
   * Récupérer une zone par ID
   */
  async getZoneById(id: string): Promise<ShippingZone> {
    return api<ShippingZone>(`/admin/shipping/zones/${id}`, 'GET')
  },

  /**
   * Créer une zone
   */
  async createZone(data: CreateZoneInput): Promise<ShippingZone> {
    return api<ShippingZone>('/admin/shipping/zones', 'POST', data)
  },

  /**
   * Mettre à jour une zone
   */
  async updateZone(
    id: string,
    data: Partial<CreateZoneInput>,
  ): Promise<ShippingZone> {
    return api<ShippingZone>(`/admin/shipping/zones/${id}`, 'PATCH', data)
  },

  /**
   * Supprimer une zone
   */
  async deleteZone(id: string): Promise<{ success: boolean }> {
    return api(`/admin/shipping/zones/${id}`, 'DELETE')
  },

  // ========================================
  // Admin endpoints - Options
  // ========================================

  /**
   * Récupérer toutes les options
   */
  async getAllOptions(): Promise<ShippingOption[]> {
    return api<ShippingOption[]>('/admin/shipping/options', 'GET')
  },

  /**
   * Récupérer une option par ID
   */
  async getOptionById(id: string): Promise<ShippingOption> {
    return api<ShippingOption>(`/admin/shipping/options/${id}`, 'GET')
  },

  /**
   * Créer une option
   */
  async createOption(data: CreateOptionInput): Promise<ShippingOption> {
    return api<ShippingOption>('/admin/shipping/options', 'POST', data)
  },

  /**
   * Mettre à jour une option
   */
  async updateOption(
    id: string,
    data: Partial<CreateOptionInput>,
  ): Promise<ShippingOption> {
    return api<ShippingOption>(`/admin/shipping/options/${id}`, 'PATCH', data)
  },

  /**
   * Supprimer une option
   */
  async deleteOption(id: string): Promise<{ success: boolean }> {
    return api(`/admin/shipping/options/${id}`, 'DELETE')
  },
}
