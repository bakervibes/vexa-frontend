import { z } from 'zod'
import { cuidSchema } from './common.schemas'

/**
 * Schema for order ID parameter
 */
export const orderIdSchema = z.object({
  orderId: cuidSchema,
})

// Types
export type OrderIdInput = z.infer<typeof orderIdSchema>
