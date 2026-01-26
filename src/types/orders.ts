import type { Address, Coupon, Order, OrderItem, Payment, User } from './models'

/**
 * Order with all relations
 * Aligned with backend Prisma relations:
 * - orderItems (not items)
 */
export interface OrderDetails extends Order {
  orderItems: OrderItem[]
  payments: Payment[]
  coupon: Coupon | null
  user: User
  payer: User
  address: Address
}
