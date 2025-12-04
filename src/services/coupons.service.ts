import type { AppliedCoupon, Coupon } from '@/types'
import { api } from '@/utils/api'
import type {
  ApplyCouponInput,
  ValidateCouponInput,
} from '@/validators/coupons.validator'

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
}
