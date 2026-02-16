import { z } from 'zod'
import {
  categoriesFilterSchema,
  cuidSchema,
  descriptionSchema,
  imagesSchema,
  limitSchema,
  nameLongSchema,
  optionsFilterSchema,
  pageSchema,
  priceRangeFilterSchema,
  priceSchema,
  searchSchema,
  slugSchema,
  sortBySchema,
  sortOrderSchema,
  stockSchema,
} from './common.schemas'

/**
 * Schéma de validation pour le filtrage des produits
 */
export const filterSchema = z.object({
  search: searchSchema.optional(),
  categories: categoriesFilterSchema.optional(),
  options: optionsFilterSchema.optional(),
  priceRange: priceRangeFilterSchema.optional(),
  page: pageSchema.optional(),
  sortBy: sortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
})

/**
 * Schéma pour les options de variante
 */
const variantOptionSchema = z.object({
  optionId: cuidSchema,
})

/**
 * Schéma pour les variantes de produit
 * combinationKey: identifiant stable basé sur les option IDs triés
 * Note: price is optional (backend generates it if not provided)
 */
const productVariantSchema = z.object({
  combinationKey: z.string().min(1),
  basePrice: priceSchema,
  price: priceSchema.optional(),
  stock: stockSchema,
  options: z.array(variantOptionSchema),
})

/**
 * Schéma de validation pour la création d'un produit
 * Aligned with backend CreateProductDto:
 * - categoryId: optional (backend)
 * - images: optional (backend)
 * - slug: optional (backend auto-generates from name)
 */
export const createProductSchema = z.object({
  categoryId: cuidSchema.optional(),
  name: nameLongSchema,
  slug: slugSchema.optional(),
  description: descriptionSchema,
  basePrice: priceSchema.optional(),
  price: priceSchema.optional(),
  stock: stockSchema.optional(),
  images: imagesSchema.optional(),
  variants: z.array(productVariantSchema).optional(),
})

/**
 * Schéma de validation pour la mise à jour d'un produit
 */
export const updateProductSchema = z.object({
  categoryId: cuidSchema.optional(),
  name: nameLongSchema.optional(),
  slug: slugSchema.optional(),
  description: descriptionSchema.optional(),
  basePrice: priceSchema.optional(),
  price: priceSchema.optional(),
  stock: stockSchema.optional(),
  images: imagesSchema.optional(),
  variants: z.array(productVariantSchema).optional(),
})

/**
 * Schéma de validation pour les paramètres de route
 */
export const productIdSchema = z.object({
  id: cuidSchema,
})

export const relatedSchema = z.object({
  limit: limitSchema,
})

export const featuredSchema = z.object({
  limit: limitSchema,
})

export const productSlugSchema = z.object({
  slug: z.string().min(1, 'Le slug est requis'),
})

export const categorySlugSchema = z.object({
  categorySlug: z.string().min(1, 'Le slug de catégorie est requis'),
})

// Types
export type FilterInput = z.infer<typeof filterSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>
export type RelatedInput = z.infer<typeof relatedSchema>
export type FeaturedInput = z.infer<typeof featuredSchema>
export type ProductSlugInput = z.infer<typeof productSlugSchema>
export type CategorySlugInput = z.infer<typeof categorySlugSchema>
