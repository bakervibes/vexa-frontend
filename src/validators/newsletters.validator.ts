import { z } from 'zod'
import { emailSchema } from './common.schemas'

// ========== Schémas spécifiques ==========

export const subscribeNewsletterSchema = z.object({
  email: emailSchema,
})

export const unsubscribeNewsletterSchema = z.object({
  email: emailSchema,
})

// ========== Types inférés ==========

export type SubscribeNewsletterInput = z.infer<typeof subscribeNewsletterSchema>
export type UnsubscribeNewsletterInput = z.infer<
  typeof unsubscribeNewsletterSchema
>
