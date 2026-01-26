<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { env } from '@/env'
import { onErrorCaptured, ref } from 'vue'
import { toast } from 'vue-sonner'

const error = ref<Error | null>(null)
const errorInfo = ref<string | null>(null)
const hasError = ref(false)

/**
 * Capture les erreurs des composants enfants
 * Vue 3 onErrorCaptured hook
 */
onErrorCaptured((err: Error, instance, info: string) => {
  error.value = err
  errorInfo.value = info
  hasError.value = true

  // Log en dev
  if (import.meta.env.DEV) {
    console.error('ErrorBoundary caught:', err)
    console.error('Component:', instance)
    console.error('Info:', info)
  }

  // Notification toast
  toast.error('Une erreur est survenue', {
    description: import.meta.env.DEV
      ? err.message
      : 'Veuillez recharger la page',
  })

  // Retourner false pour ne pas propager l'erreur
  return false
})

/**
 * Réinitialise l'état d'erreur et réessaye le rendu
 */
function retry() {
  hasError.value = false
  error.value = null
  errorInfo.value = null
}

/**
 * Recharge la page entière
 */
function reload() {
  window.location.reload()
}
</script>

<template>
  <div
    v-if="hasError"
    class="flex min-h-100 flex-col items-center justify-center p-8"
  >
    <div class="mx-auto max-w-md text-center">
      <div class="mb-6 text-6xl">
        <span class="text-red-500">!</span>
      </div>

      <h2 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Oops! Une erreur est survenue
      </h2>

      <p class="mb-6 text-gray-600 dark:text-gray-400">
        Nous sommes désolés, quelque chose s'est mal passé. Veuillez réessayer
        ou recharger la page.
      </p>

      <!-- Détails de l'erreur en développement -->
      <div
        v-if="env.VITE_ENV === 'development' && error"
        class="mb-6 rounded-lg bg-red-50 p-4 text-left dark:bg-red-900/20"
      >
        <p
          class="mb-1 font-mono text-sm font-semibold text-red-700 dark:text-red-400"
        >
          {{ error.name }}: {{ error.message }}
        </p>
        <p
          v-if="errorInfo"
          class="font-mono text-xs text-red-600 dark:text-red-300"
        >
          {{ errorInfo }}
        </p>
        <pre
          v-if="error.stack"
          class="mt-2 max-h-32 overflow-auto font-mono text-xs text-red-500 dark:text-red-300"
          >{{ error.stack }}</pre
        >
      </div>

      <div class="flex justify-center gap-4">
        <Button
          variant="outline"
          @click="retry"
        >
          Réessayer
        </Button>
        <Button @click="reload">Recharger la page</Button>
      </div>
    </div>
  </div>

  <slot v-else />
</template>
