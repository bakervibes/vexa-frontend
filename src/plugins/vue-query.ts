import { VueQueryPlugin } from '@tanstack/vue-query'
import type { VueQueryPluginOptions } from '@tanstack/vue-query'
import type { App } from 'vue'
import { isDevelopment } from '@/env'

/**
 * Configuration de Vue Query (TanStack Query)
 */
export const vueQueryConfig: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        // Temps avant de considérer les données comme périmées
        staleTime: 1000 * 60 * 5, // 5 minutes
        // Temps de cache des données
        gcTime: 1000 * 60 * 10, // 10 minutes (anciennement cacheTime)
        // Refetch quand la fenêtre reprend le focus
        refetchOnWindowFocus: !isDevelopment,
        // Retry automatique en cas d'erreur
        retry: 2,
        // Délai entre les retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // Retry des mutations en cas d'erreur
        retry: 1,
      },
    },
  },
}

/**
 * Plugin Vue Query
 */
export function setupVueQuery(app: App) {
  app.use(VueQueryPlugin, vueQueryConfig)
}
