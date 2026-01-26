import {
  changeEmail,
  changePassword,
  forgetPassword,
  getSession,
  resetPassword,
  signIn,
  signOut,
  signUp,
  updateUser,
  useUser,
} from '@/lib/auth-client'
import { useUIStore, type AuthModalMode } from '@/stores/ui.store'
import { api } from '@/utils/api'
import { useQueryClient } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

// ========================================
// Shared state (singleton pattern for errors)
// ========================================
const loginError = ref<string | null>(null)
const registerError = ref<string | null>(null)
const forgotPasswordError = ref<string | null>(null)
const resetPasswordError = ref<string | null>(null)
const changePasswordError = ref<string | null>(null)
const changeEmailError = ref<string | null>(null)
const updateProfileError = ref<string | null>(null)

/**
 * Hook for managing authentication with better-auth
 * Uses sessions (httpOnly cookies) instead of JWT/localStorage
 */
export const useAuth = () => {
  const queryClient = useQueryClient()
  const uiStore = useUIStore()

  // Get reactive refs from UI store for modals
  const { isAuthModalOpen, authModalMode } = storeToRefs(uiStore)

  // ========================================
  // better-auth session
  // useUser() provides typed and reactive user/session data
  // ========================================
  const {
    user: userRef,
    session: sessionRef,
    isPending: isPendingRef,
    error: sessionErrorRef,
  } = useUser()

  // ========================================
  // Getters (computed)
  // ========================================
  const session = computed(() => sessionRef.value)
  const user = computed(() => userRef.value)
  const isAuthenticated = computed(() => !!session.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isLoading = computed(() => isPendingRef.value)
  const sessionError = computed(() => sessionErrorRef.value)
  const userName = computed(() => user.value?.name || 'Invité')

  // ========================================
  // Helper function to invalidate queries on auth change
  // ========================================
  function invalidateUserQueries() {
    queryClient.invalidateQueries({ queryKey: ['carts'] })
    queryClient.invalidateQueries({ queryKey: ['wishlists'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    queryClient.invalidateQueries({ queryKey: ['user'] })
  }

  // ========================================
  // Helper to merge guest cart/wishlist after login
  // ========================================
  async function mergeGuestData() {
    const sessionId = getSessionId()
    if (sessionId) {
      try {
        await api<{ message: string }>('/auth/merge-guest-data', 'POST', {
          sessionId,
        })
        // Clear the session ID cookie after merge
        document.cookie = 'session_id=; Max-Age=0; path=/'
      } catch {
        // Silently ignore merge errors
      }
    }
  }

  function getSessionId(): string | undefined {
    const match = document.cookie.match(/(?:^|;\s*)session_id=([^;]*)/)
    return match?.[1] ? decodeURIComponent(match[1]) : undefined
  }

  // ========================================
  // Actions - Auth
  // ========================================

  /**
   * Login user with better-auth
   */
  async function login(
    credentials: { email: string; password: string },
    callbackUrl?: string,
  ) {
    loginError.value = null
    // Check if we have a custom callback in the store (e.g., redirect to checkout)
    const hasCustomCallback = !!uiStore.authSuccessCallback
    try {
      await signIn.email(
        {
          email: credentials.email,
          password: credentials.password,
          ...(callbackUrl && !hasCustomCallback
            ? { callbackURL: callbackUrl }
            : {}),
        },
        {
          onError: (ctx) => {
            loginError.value = ctx.error.message || 'Identifiants incorrects'
            throw new Error(loginError.value)
          },
          onSuccess: async () => {
            await mergeGuestData()
            invalidateUserQueries()
            uiStore.executeAuthSuccessCallback()
            uiStore.closeAuthModal()
          },
        },
      )
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error ? err.message : 'Erreur lors de la connexion',
      }
    }
  }

  /**
   * Register new user with better-auth
   * Auto-login is handled by better-auth after successful registration
   */
  async function register(
    credentials: {
      name: string
      email: string
      password: string
    },
    callbackUrl?: string,
  ) {
    registerError.value = null
    // Check if we have a custom callback in the store (e.g., redirect to checkout)
    const hasCustomCallback = !!uiStore.authSuccessCallback
    try {
      await signUp.email(
        {
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
          ...(callbackUrl && !hasCustomCallback
            ? { callbackURL: callbackUrl }
            : {}),
        },
        {
          onError: (ctx) => {
            registerError.value =
              ctx.error.message || "Erreur lors de l'inscription"
            throw new Error(registerError.value)
          },
          onSuccess: async () => {
            await mergeGuestData()
            invalidateUserQueries()
            uiStore.executeAuthSuccessCallback()
            uiStore.closeAuthModal()
          },
        },
      )
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error ? err.message : "Erreur lors de l'inscription",
      }
    }
  }

  /**
   * Logout user with better-auth
   */
  async function logout() {
    loginError.value = null
    registerError.value = null
    try {
      await signOut()
      invalidateUserQueries()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error ? err.message : 'Erreur lors de la déconnexion',
      }
    }
  }

  /**
   * Request password reset
   */
  async function forgotPasswordAction(email: string) {
    forgotPasswordError.value = null
    try {
      const result = await forgetPassword({
        email,
        redirectTo: '/auth/reset-password',
      })

      if (result.error) {
        forgotPasswordError.value =
          result.error.message ||
          'Erreur lors de la demande de réinitialisation'
        throw new Error(forgotPasswordError.value)
      }

      return { success: true }
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Erreur lors de la demande de réinitialisation',
      }
    }
  }

  /**
   * Reset password with token
   */
  async function resetPasswordAction(newPassword: string) {
    resetPasswordError.value = null
    try {
      await resetPassword(
        {
          newPassword,
        },
        {
          onError: (ctx) => {
            resetPasswordError.value =
              ctx.error.message ||
              'Erreur lors de la réinitialisation du mot de passe'
            throw new Error(resetPasswordError.value)
          },
        },
      )
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Erreur lors de la réinitialisation du mot de passe',
      }
    }
  }

  /**
   * Check auth status by fetching session
   * Call this on app startup
   */
  async function checkAuth() {
    try {
      await getSession()
    } catch {
      // Session not found, user is not authenticated
    }
  }

  // ========================================
  // Actions - Profile
  // ========================================

  /**
   * Change user password via better-auth
   */
  async function changePasswordAction(data: {
    currentPassword: string
    newPassword: string
  }) {
    changePasswordError.value = null
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      })
      if (result.error) {
        changePasswordError.value =
          result.error.message || 'Erreur lors du changement de mot de passe'
        throw new Error(changePasswordError.value)
      }
      await getSession()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Erreur lors du changement de mot de passe',
      }
    }
  }

  /**
   * Change user email via better-auth
   * Sends verification email to new address
   */
  async function changeEmailAction(newEmail: string) {
    changeEmailError.value = null
    try {
      const result = await changeEmail({
        newEmail,
        callbackURL: `${window.location.origin}/my-account/profile`,
      })
      if (result.error) {
        changeEmailError.value =
          result.error.message || "Erreur lors du changement d'email"
        throw new Error(changeEmailError.value)
      }
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Erreur lors du changement d'email",
      }
    }
  }

  /**
   * Update user profile (name, image) via better-auth
   */
  async function updateProfileAction(data: { name?: string; image?: string }) {
    updateProfileError.value = null
    try {
      const result = await updateUser(data)
      if (result.error) {
        updateProfileError.value =
          result.error.message || 'Erreur lors de la mise à jour du profil'
        throw new Error(updateProfileError.value)
      }
      await getSession()
      invalidateUserQueries()
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Erreur lors de la mise à jour du profil',
      }
    }
  }

  // ========================================
  // Actions - Modal (delegates to UI store)
  // ========================================

  /**
   * Ouvrir le modal d'authentification
   */
  function openAuthModal(
    mode: AuthModalMode = 'login',
    onSuccess?: () => void,
  ) {
    if (isAuthenticated.value) {
      if (onSuccess) {
        onSuccess()
      }
      return
    }
    uiStore.openAuthModal(mode, onSuccess)
  }

  /**
   * Fermer le modal d'authentification
   */
  function closeAuthModal() {
    uiStore.closeAuthModal()
  }

  /**
   * Gérer le succès de l'authentification
   */
  function handleAuthSuccess() {
    uiStore.executeAuthSuccessCallback()
    uiStore.closeAuthModal()
  }

  /**
   * Changer le mode du modal (login <-> register)
   */
  function switchModalMode(mode: AuthModalMode) {
    uiStore.switchAuthModalMode(mode)
  }

  // ========================================
  // Return (expose public API)
  // ========================================

  return {
    // State
    user,
    session,
    isLoading,
    error: loginError, // Alias for backwards compatibility
    loginError,
    registerError,
    forgotPasswordError,
    resetPasswordError,
    changePasswordError,
    changeEmailError,
    updateProfileError,
    sessionError,
    accessToken: computed(() => session.value?.token ?? null), // For backwards compatibility

    // State - Modal (from store)
    isModalOpen: isAuthModalOpen,
    modalMode: authModalMode,

    // Getters
    isAuthenticated,
    isAdmin,
    userName,

    // Actions - Auth
    login,
    register,
    logout,
    checkAuth,
    forgotPassword: forgotPasswordAction,
    resetPassword: resetPasswordAction,
    fetchUserProfile: checkAuth, // Alias for backwards compatibility

    // Actions - Profile
    changePassword: changePasswordAction,
    changeEmail: changeEmailAction,
    updateProfile: updateProfileAction,

    // Actions - Modal
    openAuthModal,
    closeAuthModal,
    handleAuthSuccess,
    switchModalMode,

    // Loading states
    isLogingIn: computed(() => false), // TODO: Add loading state from signIn
    isRegistering: computed(() => false), // TODO: Add loading state from signUp
    isLoggingOut: computed(() => false),
    isForgotingPassword: computed(() => false),
    isResettingPassword: computed(() => false),
    isChangingPassword: computed(() => false),
    isChangingEmail: computed(() => false),
    isUpdatingProfile: computed(() => false),
  }
}
