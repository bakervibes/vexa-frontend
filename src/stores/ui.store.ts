import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AuthModalMode = 'login' | 'register'

/**
 * Store Pinia pour la gestion de l'UI globale
 * Gère les modals, les états UI partagés, etc.
 */
export const useUIStore = defineStore('ui', () => {
  // ========================================
  // Auth Modal State
  // ========================================
  const isAuthModalOpen = ref(false)
  const authModalMode = ref<AuthModalMode>('login')
  const authSuccessCallback = ref<(() => void) | null>(null)

  // ========================================
  // Auth Modal Actions
  // ========================================

  /**
   * Open auth modal with optional mode and success callback
   */
  function openAuthModal(
    mode: AuthModalMode = 'login',
    onSuccess?: () => void,
  ) {
    authModalMode.value = mode
    authSuccessCallback.value = onSuccess ?? null
    isAuthModalOpen.value = true
  }

  /**
   * Close auth modal and clear callback
   */
  function closeAuthModal() {
    isAuthModalOpen.value = false
    authSuccessCallback.value = null
  }

  /**
   * Switch modal mode (login <-> register)
   */
  function switchAuthModalMode(mode: AuthModalMode) {
    authModalMode.value = mode
  }

  /**
   * Execute success callback if exists
   */
  function executeAuthSuccessCallback() {
    if (authSuccessCallback.value) {
      authSuccessCallback.value()
    }
  }

  // ========================================
  // Global UI State
  // ========================================
  const isSidebarOpen = ref(false)
  const isMobileMenuOpen = ref(false)

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  function closeMobileMenu() {
    isMobileMenuOpen.value = false
  }

  return {
    // Auth Modal
    isAuthModalOpen,
    authModalMode,
    authSuccessCallback,
    openAuthModal,
    closeAuthModal,
    switchAuthModalMode,
    executeAuthSuccessCallback,

    // Global UI
    isSidebarOpen,
    isMobileMenuOpen,
    toggleSidebar,
    toggleMobileMenu,
    closeMobileMenu,
  }
})
