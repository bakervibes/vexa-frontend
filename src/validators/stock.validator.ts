import { z } from 'zod'
import { cuidSchema, stockSchema } from './common.schemas'

/**
 * Raisons de mouvement de stock
 */
export const stockMovementReasonSchema = z.enum([
  'MANUAL_ADJUSTMENT',
  'INVENTORY_COUNT',
  'DAMAGED_GOODS',
  'OTHER',
])

/**
 * Types de mouvement de stock
 */
export const stockMovementTypeSchema = z.enum(['ADDITION', 'DEDUCTION'])

/**
 * Schéma de base pour l'ajustement de stock
 */
export const stockAdjustmentSchema = z.object({
  productId: cuidSchema,
  variantId: cuidSchema.optional(),
  newStock: stockSchema,
  reason: stockMovementReasonSchema,
  note: z.string().optional(),
})

/**
 * Schéma pour le retrait de stock (note obligatoire)
 */
export const stockRemovalSchema = stockAdjustmentSchema.extend({
  note: z.string().min(1, 'Une raison est requise pour les retraits de stock'),
})

/**
 * Schéma pour l'ajustement en masse
 */
export const bulkStockAdjustmentItemSchema = z.object({
  productId: cuidSchema,
  variantId: cuidSchema.optional(),
  newStock: stockSchema,
})

export const bulkStockAdjustmentSchema = z.object({
  adjustments: z
    .array(bulkStockAdjustmentItemSchema)
    .min(1, 'Au moins un ajustement requis'),
  reason: stockMovementReasonSchema,
  note: z.string().optional(),
})

/**
 * Schéma pour le formulaire d'ajustement (frontend)
 * Utilisé pour la saisie utilisateur avant transformation
 */
export const stockAdjustmentFormSchema = z.object({
  type: stockMovementTypeSchema,
  quantity: z.number().int().min(1, 'La quantité doit être au moins 1'),
  reason: stockMovementReasonSchema,
  note: z.string().optional(),
})

/**
 * Schéma avec validation conditionnelle pour retrait
 */
export const stockAdjustmentFormWithValidationSchema =
  stockAdjustmentFormSchema.refine(
    (data) => {
      if (data.type === 'DEDUCTION') {
        return data.note && data.note.trim().length > 0
      }
      return true
    },
    {
      message: 'Une raison est requise pour les retraits de stock',
      path: ['note'],
    },
  )

// Types
export type StockMovementReason = z.infer<typeof stockMovementReasonSchema>
export type StockMovementType = z.infer<typeof stockMovementTypeSchema>
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>
export type StockRemovalInput = z.infer<typeof stockRemovalSchema>
export type BulkStockAdjustmentInput = z.infer<typeof bulkStockAdjustmentSchema>
export type StockAdjustmentFormInput = z.infer<typeof stockAdjustmentFormSchema>
