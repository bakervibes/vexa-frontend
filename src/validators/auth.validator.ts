import { z } from 'zod'
import {
  emailSchema,
  nameSchema,
  passwordSchema,
  refreshTokenSchema,
} from './common.schemas'

// ========== Schémas de validation ==========

export const registerBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const loginBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const refreshTokenBodySchema = z.object({
  refreshToken: refreshTokenSchema,
})

// ========== Types inférés ==========

export type RegisterInput = z.infer<typeof registerBodySchema>
export type LoginInput = z.infer<typeof loginBodySchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenBodySchema>
