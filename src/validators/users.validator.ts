import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'
import { emailSchema, nameSchema, passwordSchema } from './common.schemas'

// ========== Schémas de validation ==========

export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.string().refine((value) => isValidPhoneNumber(value), {
    message: 'Veuillez entrer un numéro de téléphone valide',
  }),
})

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

export const updateProfileImageSchema = z.object({
  imageUrl: z.url('Invalid image URL'),
})

// ========== Types inférés ==========

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type UpdateProfileImageInput = z.infer<typeof updateProfileImageSchema>
