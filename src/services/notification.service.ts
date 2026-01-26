import { api } from '@/utils/api'

export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'ORDER_REFUNDED'
  | 'LOW_STOCK_ALERT'
  | 'OUT_OF_STOCK_ALERT'
  | 'STOCK_REPLENISHED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED'
  | 'NEW_REVIEW'
  | 'REVIEW_RESPONSE'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'ACCOUNT_UPDATE'
  | 'WELCOME'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface NotificationsResponse {
  data: Notification[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
    unreadCount?: number
  }
}

export interface NotificationFilters {
  page?: number
  limit?: number
  isRead?: boolean
  type?: NotificationType
}

export const notificationService = {
  /**
   * Récupérer les notifications de l'utilisateur
   */
  async getNotifications(
    filters?: NotificationFilters,
  ): Promise<NotificationsResponse> {
    const params = new URLSearchParams()
    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.limit) params.set('limit', String(filters.limit))
    if (filters?.isRead !== undefined)
      params.set('isRead', String(filters.isRead))
    if (filters?.type) params.set('type', filters.type)

    const queryString = params.toString()
    return api<NotificationsResponse>(
      `/notifications${queryString ? `?${queryString}` : ''}`,
      'GET',
    )
  },

  /**
   * Récupérer le nombre de notifications non lues
   */
  async getUnreadCount(): Promise<{ count: number }> {
    return api<{ count: number }>('/notifications/unread-count', 'GET')
  },

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(id: string): Promise<Notification> {
    return api<Notification>(`/notifications/${id}/read`, 'PATCH')
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<{ success: boolean; count: number }> {
    return api<{ success: boolean; count: number }>(
      '/notifications/mark-all-read',
      'POST',
    )
  },

  /**
   * Supprimer une notification
   */
  async deleteNotification(id: string): Promise<{ success: boolean }> {
    return api<{ success: boolean }>(`/notifications/${id}`, 'DELETE')
  },
}

// Helper pour obtenir l'icône selon le type de notification
export const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    ORDER_PLACED: 'shopping-cart',
    ORDER_CONFIRMED: 'check-circle',
    ORDER_SHIPPED: 'truck',
    ORDER_DELIVERED: 'package-check',
    ORDER_CANCELLED: 'x-circle',
    ORDER_REFUNDED: 'rotate-ccw',
    LOW_STOCK_ALERT: 'alert-triangle',
    OUT_OF_STOCK_ALERT: 'alert-octagon',
    STOCK_REPLENISHED: 'package-plus',
    PAYMENT_RECEIVED: 'credit-card',
    PAYMENT_FAILED: 'credit-card',
    NEW_REVIEW: 'star',
    REVIEW_RESPONSE: 'message-circle',
    SYSTEM_ANNOUNCEMENT: 'megaphone',
    ACCOUNT_UPDATE: 'user',
    WELCOME: 'sparkles',
  }
  return icons[type] || 'bell'
}

// Helper pour obtenir la couleur selon le type de notification
export const getNotificationColor = (type: NotificationType): string => {
  const colors: Record<NotificationType, string> = {
    ORDER_PLACED: 'text-blue-500',
    ORDER_CONFIRMED: 'text-green-500',
    ORDER_SHIPPED: 'text-purple-500',
    ORDER_DELIVERED: 'text-green-600',
    ORDER_CANCELLED: 'text-red-500',
    ORDER_REFUNDED: 'text-orange-500',
    LOW_STOCK_ALERT: 'text-yellow-500',
    OUT_OF_STOCK_ALERT: 'text-red-600',
    STOCK_REPLENISHED: 'text-green-500',
    PAYMENT_RECEIVED: 'text-green-500',
    PAYMENT_FAILED: 'text-red-500',
    NEW_REVIEW: 'text-yellow-500',
    REVIEW_RESPONSE: 'text-blue-500',
    SYSTEM_ANNOUNCEMENT: 'text-purple-500',
    ACCOUNT_UPDATE: 'text-blue-500',
    WELCOME: 'text-pink-500',
  }
  return colors[type] || 'text-gray-500'
}
