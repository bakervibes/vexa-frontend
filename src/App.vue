<script setup lang="ts">
/**
 * App.vue
 * Point d'entrée de l'application
 *
 * Le RouterView affiche maintenant les layouts appropriés selon la route :
 * - AuthLayout pour /auth/* (SignIn, SignUp)
 * - DefaultLayout pour les pages publiques (Home, Shop)
 * - AdminLayout pour /admin/* (Dashboard, etc.)
 */
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import AuthModal from '@/components/views/auth/AuthModal.vue'
import { useAuth } from '@/composables/useAuth'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

const { isModalOpen, modalMode, handleAuthSuccess } = useAuth()

onMounted(() => {
  // Initialize session ID
  if (!localStorage.getItem('session_id')) {
    localStorage.setItem('session_id', crypto.randomUUID())
  }
})
</script>

<template>
  <!-- Skip to main content link for accessibility -->
  <a
    href="#main-content"
    class="focus:bg-primary focus:text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
  >
    Aller au contenu principal
  </a>

  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>

  <AuthModal
    v-model:open="isModalOpen"
    :initial-mode="modalMode"
    @success="handleAuthSuccess"
  />
</template>

<style scoped></style>
