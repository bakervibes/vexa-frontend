import type { Coupon } from './models'

/**
 * Applied coupon with discount calculation
 */
export interface AppliedCoupon extends Coupon {
  discountAmount: number
  originalTotal: number
  finalTotal: number
}
