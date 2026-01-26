import type { User } from '@/types/models'
import { api } from '@/utils/api'

/**
 * User service for non-auth related operations
 * Auth operations (password, email, name, image) are handled by better-auth
 */
export const userService = {
  /**
   * Update user profile (phone only - other fields handled by better-auth)
   */
  async updateProfile(data: { phone?: string }) {
    return api<User>('/users/me', 'PATCH', data)
  },
}
