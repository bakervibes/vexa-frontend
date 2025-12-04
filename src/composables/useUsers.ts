import { userService } from '@/services/users.service'
import { useAuthStore } from '@/stores/auth'
import type {
  ChangePasswordInput,
  UpdateProfileImageInput,
  UpdateProfileInput,
} from '@/validators/users.validator'
import { useMutation } from '@tanstack/vue-query'
import { computed } from 'vue'
import { toast } from 'vue-sonner'

/**
 * Composable for user profile mutations
 */
export function useUsersMutation() {
  const authStore = useAuthStore()

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => userService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // Update auth store with new user data
      authStore.user = updatedUser
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      toast.success('Profile updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })

  // Mutation to update profile image
  const updateProfileImageMutation = useMutation({
    mutationFn: (data: UpdateProfileImageInput) =>
      userService.updateProfileImage(data),
    onSuccess: (updatedUser) => {
      // Update auth store with new user data
      authStore.user = updatedUser
      localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      toast.success('Profile image updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile image')
    },
  })

  // Mutation to change password
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => userService.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change password')
    },
  })

  /**
   * Update user profile
   */
  async function updateProfile(data: UpdateProfileInput) {
    return updateProfileMutation.mutateAsync(data)
  }

  /**
   * Update profile image
   */
  async function updateProfileImage(imageUrl: string) {
    return updateProfileImageMutation.mutateAsync({ imageUrl })
  }

  /**
   * Change password
   */
  async function changePassword(data: ChangePasswordInput) {
    return changePasswordMutation.mutateAsync(data)
  }

  return {
    // Actions
    updateProfile,
    updateProfileImage,
    changePassword,

    // Loading states
    isUpdatingProfile: computed(() => updateProfileMutation.isPending.value),
    isUpdatingImage: computed(() => updateProfileImageMutation.isPending.value),
    isChangingPassword: computed(() => changePasswordMutation.isPending.value),

    // Error states
    updateProfileError: computed(() => updateProfileMutation.error.value),
    updateImageError: computed(() => updateProfileImageMutation.error.value),
    changePasswordError: computed(() => changePasswordMutation.error.value),
  }
}
