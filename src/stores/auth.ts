import type { AuthResponse } from '@/types'
import type { User } from '@/types/models'
import { api } from '@/utils/api'
import type { LoginInput, RegisterInput } from '@/validators/auth.validator'
import { useQueryClient } from '@tanstack/vue-query'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const queryClient = useQueryClient()

  // ========================================
  // Helper function to invalidate user queries
  // ========================================
  function invalidateUserQueries() {
    queryClient.invalidateQueries({ queryKey: ['cart'] })
    queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['products', 'featured'] })
    queryClient.invalidateQueries({ queryKey: ['products', 'related'] })
  }

  // ========================================
  // State
  // ========================================

  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ========================================
  // Getters (computed)
  // ========================================

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const userName = computed(() => user.value?.name || 'Invité')

  // ========================================
  // Actions
  // ========================================

  /**
   * Connexion de l'utilisateur
   */
  async function login(credentials: LoginInput) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api<AuthResponse>(
        '/auth/login',
        'POST',
        credentials,
      )

      // Sauvegarder dans le state
      user.value = response.user
      accessToken.value = response.tokens.accessToken
      refreshToken.value = response.tokens.refreshToken

      // Persister dans le localStorage
      localStorage.setItem('auth_token', response.tokens.accessToken)
      localStorage.setItem('auth_refresh_token', response.tokens.refreshToken)
      localStorage.setItem('auth_user', JSON.stringify(response.user))

      invalidateUserQueries()

      return { success: true }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Erreur lors de la connexion'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async function register(credentials: RegisterInput) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api<AuthResponse>(
        '/auth/register',
        'POST',
        credentials,
      )

      // Sauvegarder dans le state
      user.value = response.user
      accessToken.value = response.tokens.accessToken
      refreshToken.value = response.tokens.refreshToken

      // Persister dans le localStorage
      localStorage.setItem('auth_token', response.tokens.accessToken)
      localStorage.setItem('auth_refresh_token', response.tokens.refreshToken)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
      invalidateUserQueries()

      return { success: true }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Erreur lors de l'inscription"
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Récupérer le profil utilisateur complet
   */
  async function fetchUserProfile() {
    try {
      const response = await api<User>('/auth/me', 'GET')
      user.value = response
      localStorage.setItem('auth_user', JSON.stringify(response))
    } catch (err) {
      console.error('Erreur lors de la récupération du profil:', err)
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async function logout() {
    try {
      // Envoyer la requête de déconnexion au backend
      if (refreshToken.value) {
        await api('/auth/logout', 'POST', { refreshToken: refreshToken.value })
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    } finally {
      // Nettoyer le state (même en cas d'erreur)
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      error.value = null

      // Nettoyer le localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_user')
      localStorage.setItem('session_id', crypto.randomUUID())

      invalidateUserQueries()
    }

    return { success: true }
  }

  /**
   * Vérifier et restaurer l'authentification depuis le localStorage
   * À appeler au démarrage de l'app (main.ts)
   */
  async function checkAuth() {
    const savedToken = localStorage.getItem('auth_token')
    const savedRefreshToken = localStorage.getItem('auth_refresh_token')
    const savedUser = localStorage.getItem('auth_user')

    if (savedToken && savedUser) {
      try {
        accessToken.value = savedToken
        refreshToken.value = savedRefreshToken
        user.value = JSON.parse(savedUser)

        // Vérifier la validité du token en récupérant le profil
        await fetchUserProfile()
      } catch {
        // Si erreur, nettoyer
        logout()
      }
    }
  }

  // ========================================
  // Return (expose public API)
  // ========================================

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isAdmin,
    userName,

    // Actions
    login,
    register,
    logout,
    checkAuth,
    fetchUserProfile,
  }
})
