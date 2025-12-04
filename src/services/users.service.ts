import type { User } from '@/types/models'
import { api } from '@/utils/api'
import type {
  ChangePasswordInput,
  UpdateProfileImageInput,
  UpdateProfileInput,
} from '@/validators/users.validator'

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile() {
    return api<User>('/users/me', 'GET')
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileInput) {
    return api<User>('/users/me', 'PATCH', data)
  },

  /**
   * Update profile image
   */
  async updateProfileImage(data: UpdateProfileImageInput) {
    return api<User>('/users/me/image', 'PATCH', data)
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordInput) {
    return api<void>('/users/me/password', 'PATCH', data)
  },
}
