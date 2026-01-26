import type { AppliedCoupon, Coupon } from '@/types'
import { api } from '@/utils/api'
import type {
  ApplyCouponInput,
  ValidateCouponInput,
} from '@/validators/coupons.validator'

export interface CreateCouponInput {
  code: string
  description?: string
  value: number
  type: 'PERCENTAGE' | 'FIXED'
  usageLimit?: number
  minOrderAmount?: number
  expiresAt?: string
  isActive?: boolean
}

export interface UpdateCouponInput {
  code?: string
  description?: string
  value?: number
  type?: 'PERCENTAGE' | 'FIXED'
  usageLimit?: number
  minOrderAmount?: number
  expiresAt?: string
  isActive?: boolean
}

export const couponService = {
  async validateCoupon(data: ValidateCouponInput) {
    return api<Coupon>(
      `/coupons/validate?code=${encodeURIComponent(data.code)}`,
      'GET',
    )
  },

  async getCouponByCode(code: string) {
    return api<Coupon>(`/coupons/${encodeURIComponent(code)}`, 'GET')
  },

  async applyCoupon(data: ApplyCouponInput) {
    return api<AppliedCoupon>('/coupons/apply', 'POST', data)
  },

  async getActiveCoupons() {
    return api<Coupon[]>('/coupons', 'GET')
  },

  // Admin methods
  async getAllCoupons(includeInactive = true) {
    const query = includeInactive ? '?includeInactive=true' : ''
    return api<Coupon[]>(`/coupons${query}`, 'GET')
  },

  async createCoupon(data: CreateCouponInput) {
    return api<Coupon>('/coupons', 'POST', data)
  },

  async updateCoupon(id: string, data: UpdateCouponInput) {
    return api<Coupon>(`/coupons/${id}`, 'PATCH', data)
  },

  async deleteCoupon(id: string) {
    return api<Coupon>(`/coupons/${id}`, 'DELETE')
  },
}
