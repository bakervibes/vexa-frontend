import { OrderStatus, PaymentProvider, ShippingType } from '@/types'
import { z } from 'zod'
import { addressSchema, cuidSchema } from './common.schemas'

// Enum pour order status
const orderStatusEnum = z.enum(OrderStatus)

// Enum pour shipping type
const shippingTypeEnum = z.enum(ShippingType)

// ========== Schémas spécifiques ==========

/**
 * Schema for coupon code (optional)
 */
const couponCodeSchema = z
  .string()
  .min(1, 'Le code coupon est requis')
  .max(50, 'Le code coupon ne peut pas dépasser 50 caractères')
  .trim()
  .toUpperCase()
  .optional()
  .nullable()

/**
 * Schema for shipping option in checkout form
 */
export const checkoutShippingOptionSchema = z.object({
  id: z.string().min(1, 'Shipping option ID is required'),
  label: z.string().min(1, 'Shipping option label is required'),
  price: z.number().min(0, 'Le prix doit être positif'),
  isPercentage: z.boolean(),
})

/**
 * Schema for payment in checkout form
 */
export const checkoutPaymentSchema = z.object({
  provider: z.enum(PaymentProvider),
  transactionId: z.string(),
  metadata: z.record(z.string(), z.any()),
})

/**
 * Schema for checkout form (UI-facing)
 * Contains all fields needed for the checkout UI
 */
export const checkoutFormSchema = z.object({
  address: addressSchema,
  payment: checkoutPaymentSchema,
  coupon: couponCodeSchema,
  shippingOption: checkoutShippingOptionSchema,
})

/**
 * Schema for creating an order (API-facing)
 * Aligned with backend CreateOrderDto
 */
export const createOrderSchema = z.object({
  addressId: cuidSchema,
  shippingType: shippingTypeEnum,
  shippingOptionId: cuidSchema.optional(),
  couponCode: couponCodeSchema,
  notes: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
})

export const orderIdSchema = z.object({
  id: cuidSchema,
})

export const orderNumberSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
})

// ========== Types inférés ==========

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>
export type CheckoutShippingOptionInput = z.infer<
  typeof checkoutShippingOptionSchema
>
export type CheckoutPaymentInput = z.infer<typeof checkoutPaymentSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type OrderIdInput = z.infer<typeof orderIdSchema>
export type OrderNumberInput = z.infer<typeof orderNumberSchema>
