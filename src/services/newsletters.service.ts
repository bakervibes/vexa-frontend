import { api } from '@/utils/api'
import type { SubscribeNewsletterInput } from '@/validators/newsletters.validator'

export interface NewsletterSubscriber {
  id: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NewsletterStats {
  total: number
  active: number
  inactive: number
}

export interface NewsletterSubscribersResponse {
  data: NewsletterSubscriber[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

export interface NewsletterFilters {
  page?: number
  limit?: number
  activeOnly?: boolean
}

export const newsletterService = {
  /**
   * S'inscrire à la newsletter
   */
  async subscribe(data: SubscribeNewsletterInput) {
    return api<NewsletterSubscriber>('/newsletters/subscribe', 'POST', data)
  },

  /**
   * Se désinscrire de la newsletter
   */
  async unsubscribe(email: string) {
    return api<NewsletterSubscriber>('/newsletters/unsubscribe', 'POST', {
      email,
    })
  },

  /**
   * Récupérer tous les abonnés (Admin)
   */
  async getAll() {
    return api<NewsletterSubscriber[]>('/newsletters', 'GET')
  },

  /**
   * Récupérer tous les abonnés actifs (Admin)
   */
  async getAllActive() {
    return api<NewsletterSubscriber[]>('/newsletters/active', 'GET')
  },

  /**
   * Supprimer un abonné (Admin)
   */
  async remove(email: string) {
    return api<{ message: string }>('/newsletters', 'DELETE', { email })
  },

  /**
   * Récupérer les abonnés avec pagination (Admin)
   */
  async getSubscribers(filters: NewsletterFilters = {}) {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    if (filters.activeOnly !== undefined)
      params.append('activeOnly', String(filters.activeOnly))
    const query = params.toString() ? `?${params.toString()}` : ''
    return api<NewsletterSubscribersResponse>(
      `/newsletters/subscribers${query}`,
      'GET',
    )
  },

  /**
   * Récupérer les statistiques (Admin)
   */
  async getStats() {
    return api<NewsletterStats>('/newsletters/stats', 'GET')
  },
}
