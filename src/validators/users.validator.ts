import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'
import { nameSchema, passwordSchema } from './common.schemas'

// ========== Schémas de validation ==========

/**
 * Schema for updating user profile (name, phone only)
 * Email is handled separately via better-auth changeEmail
 */
export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || isValidPhoneNumber(value), {
      message: 'Veuillez entrer un numéro de téléphone valide',
    }),
})

/**
 * Schema for changing password via better-auth
 */
export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ========== Types inférés ==========

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
