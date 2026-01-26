import { z } from 'zod'
import { cuidSchema, quantitySchema } from './common.schemas'

// ========== Schémas spécifiques ==========

/**
 * Schema for quantity in cart update (allows 0 for implicit deletion)
 * Aligned with backend UpdateCartItemDto
 */
const updateQuantitySchema = z
  .number({ message: 'Quantité invalide' })
  .int('La quantité doit être un entier')
  .min(0, 'La quantité doit être positive ou nulle')

export const addCartItemSchema = z.object({
  productId: cuidSchema,
  variantId: cuidSchema.optional(),
  quantity: quantitySchema,
})

/**
 * Schema for updating cart item
 * Note: quantity >= 0 (0 = implicit deletion)
 */
export const updateCartItemSchema = z.object({
  itemId: cuidSchema,
  quantity: updateQuantitySchema,
})

export const removeCartItemSchema = z.object({
  itemId: cuidSchema,
})

// ========== Types inférés ==========

export type addCartItemInput = z.infer<typeof addCartItemSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>
