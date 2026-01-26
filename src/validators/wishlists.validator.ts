import { z } from 'zod'
import { cuidSchema } from './common.schemas'

// ========== Schémas spécifiques ==========

export const addWishlistItemSchema = z.object({
  productId: cuidSchema,
  variantId: cuidSchema.optional(),
})

export const removeWishlistItemSchema = z.object({
  productId: cuidSchema,
  variantId: cuidSchema.optional(),
})

// ========== Types inférés ==========

export type addWishlistItemInput = z.infer<typeof addWishlistItemSchema>
export type removeWishlistItemInput = z.infer<typeof removeWishlistItemSchema>
