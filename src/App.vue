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
import AuthModal from '@/components/views/auth/AuthModal.vue'
import { useAuthModal } from '@/composables/useAuthModal'
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

const { isOpen, initialMode, handleSuccess } = useAuthModal()

onMounted(() => {
  // Générer un ID de session pour les invités s'il n'existe pas
  if (!localStorage.getItem('session_id')) {
    localStorage.setItem('session_id', crypto.randomUUID())
  }
})
</script>

<template>
  <RouterView />

  <!-- Global Auth Modal -->
  <AuthModal
    v-model:open="isOpen"
    :initial-mode="initialMode"
    @success="handleSuccess"
  />
</template>

<style scoped></style>
