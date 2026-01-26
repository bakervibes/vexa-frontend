/**
 * @deprecated Ce store n'est plus utilisé avec better-auth.
 * Utilisez le composable useAuth() à la place.
 *
 * better-auth gère l'état d'authentification via des cookies httpOnly.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

/**
 * Store Pinia minimal pour compatibilité arrière
 * L'état réel est géré par better-auth via useAuth()
 */
export const useAuthStore = defineStore('auth', () => {
  const isInitialized = ref(false)

  function setInitialized() {
    isInitialized.value = true
  }

  return {
    isInitialized,
    setInitialized,

    // Deprecated: ces getters retournent toujours false/null
    // Utilisez useAuth() pour l'état d'authentification réel
    isAuthenticated: computed(() => false),
    isAdmin: computed(() => false),
    user: ref(null),
    accessToken: ref(null),
  }
})
