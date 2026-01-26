import { api } from '@/utils/api'

export interface StoreSettings {
  name: string
  email: string
  phone: string
  address: string
  currency: string
  language: string
  timezone: string
}

export interface ShippingSettings {
  freeShippingThreshold: number
  defaultShippingCost: number
  enableLocalPickup: boolean
  localPickupAddress: string
  estimatedDeliveryDays: string
}

export interface PaymentSettings {
  enableCOD: boolean
  enableMobileMoney: boolean
  enableBankTransfer: boolean
  mobileMoneyProviders: string[]
}

export interface NotificationSettings {
  orderConfirmation: boolean
  orderShipped: boolean
  orderDelivered: boolean
  lowStockAlert: boolean
  lowStockThreshold: number
  newsletterEnabled: boolean
}

export interface Settings {
  store: StoreSettings
  shipping: ShippingSettings
  payment: PaymentSettings
  notifications: NotificationSettings
}

export interface UpdateSettingsInput {
  store?: Partial<StoreSettings>
  shipping?: Partial<ShippingSettings>
  payment?: Partial<PaymentSettings>
  notifications?: Partial<NotificationSettings>
}

export const settingsService = {
  async getSettings() {
    return api<Settings>('/admin/settings', 'GET')
  },

  async updateSettings(data: UpdateSettingsInput) {
    return api<Settings>('/admin/settings', 'PUT', data)
  },
}
