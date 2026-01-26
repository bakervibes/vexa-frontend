import { isValidPhoneNumber } from 'libphonenumber-js'
import { z } from 'zod'
import { cuidSchema } from './common.schemas'

// ========== Schémas spécifiques ==========

/**
 * Schema for creating an address
 * Aligned with backend CreateAddressDto:
 * - isDefault: optional (defaults to false)
 */
export const createAddressSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.email('Email invalide').toLowerCase().trim(),
  phone: z.string().refine((value) => isValidPhoneNumber(value), {
    message: 'Veuillez entrer un numéro de téléphone valide',
  }),
  street: z.string().min(1, 'La rue est requise'),
  city: z.string().min(1, 'La ville est requise'),
  country: z.string().min(1, 'Le pays est requis'),
  isDefault: z.boolean().optional(),
})

export const updateAddressSchema = z
  .object({
    name: z.string().min(1, 'Le nom est requis'),
    email: z.email('Email invalide').toLowerCase().trim(),
    phone: z.string().refine((value) => isValidPhoneNumber(value), {
      message: 'Veuillez entrer un numéro de téléphone valide',
    }),
    street: z.string().min(1, 'La rue est requise'),
    city: z.string().min(1, 'La ville est requise'),
    country: z.string().min(1, 'Le pays est requis'),
    isDefault: z.boolean().optional(),
  })
  .partial()

export const addressIdSchema = z.object({
  id: cuidSchema,
})

// ========== Types inférés ==========

export type CreateAddressInput = z.infer<typeof createAddressSchema>
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>
export type AddressIdInput = z.infer<typeof addressIdSchema>
