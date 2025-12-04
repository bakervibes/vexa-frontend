import type { ReviewWithUser } from '@/types'
import { api } from '@/utils/api'
import type {
  AddReviewInput,
  ReviewsQueryInput,
  UpdateReviewInput,
} from '@/validators/reviews.validator'

export interface PaginatedReviewsResponse {
  reviews: ReviewWithUser[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export const reviewService = {
  async getReviews(productId: string, options: ReviewsQueryInput) {
    const params = new URLSearchParams()
    if (options.page) params.append('page', String(options.page))
    if (options.limit) params.append('limit', String(options.limit))
    const queryString = params.toString() ? `?${params.toString()}` : ''
    return api<PaginatedReviewsResponse>(
      `/reviews/product/${productId}${queryString}`,
      'GET',
    )
  },

  async addReview(data: AddReviewInput) {
    return api<ReviewWithUser>('/reviews', 'POST', data)
  },

  async updateReview(id: string, data: UpdateReviewInput) {
    return api<ReviewWithUser>(`/reviews/${id}`, 'PATCH', data)
  },

  async deleteReview(id: string) {
    return api<ReviewWithUser>(`/reviews/${id}`, 'DELETE')
  },

  async approveReview(id: string) {
    return api<ReviewWithUser>(`/reviews/${id}/approve`, 'PATCH')
  },

  async disapproveReview(id: string) {
    return api<ReviewWithUser>(`/reviews/${id}/disapprove`, 'PATCH')
  },
}
