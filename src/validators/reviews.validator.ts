import { z } from 'zod'
import {
  commentSchema,
  cuidSchema,
  limitSchema,
  pageSchema,
  ratingSchema,
} from './common.schemas'

/**
 * Schema for adding a review
 * Aligned with backend CreateReviewDto:
 * - comment: optional (backend)
 */
export const addReviewSchema = z.object({
  productId: cuidSchema,
  rating: ratingSchema,
  comment: commentSchema.optional(),
})

/**
 * Schema for updating a review
 * Aligned with backend UpdateReviewDto:
 * - comment: optional (backend)
 */
export const updateReviewSchema = z.object({
  rating: ratingSchema,
  comment: commentSchema.optional(),
})

/**
 * Schema for review ID parameter
 */
export const reviewIdSchema = z.object({
  id: cuidSchema,
})

/**
 * Schema for product ID parameter
 */
export const productIdSchema = z.object({
  productId: cuidSchema,
})

/**
 * Schema for reviews query parameters (pagination)
 */
export const reviewsQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
})

// Types
export type AddReviewInput = z.infer<typeof addReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type ReviewIdInput = z.infer<typeof reviewIdSchema>
export type ProductIdInput = z.infer<typeof productIdSchema>
export type ReviewsQueryInput = z.infer<typeof reviewsQuerySchema>
