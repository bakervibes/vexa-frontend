import { z } from 'zod'
import { emailSchema, nameSchema, passwordSchema } from './common.schemas'

// ========== Schémas de validation ==========

export const registerBodySchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().optional(),
})

export const loginBodySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const forgotPasswordBodySchema = z.object({
  email: emailSchema,
})

export const resetPasswordBodySchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

// ========== Types inférés ==========

export type RegisterInput = z.infer<typeof registerBodySchema>
export type LoginInput = z.infer<typeof loginBodySchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>
