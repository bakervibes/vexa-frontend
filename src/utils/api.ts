import { env } from '@/env'
import type { TokenPair } from '@/types'

/**
 * Configuration de l'API basée sur les variables d'environnement
 */
export const apiConfig = {
  baseURL: env.VITE_API_URL,
  timeout: env.VITE_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
} as const

/**
 * Méthodes HTTP supportées
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/**
 * Options de configuration pour les requêtes API
 */
export interface ApiRequestConfig extends Omit<RequestInit, 'method' | 'body'> {
  /** Headers additionnels */
  headers?: HeadersInit
  /** Timeout personnalisé (en ms) */
  timeout?: number
  /** Inclure les credentials (cookies) */
  withCredentials?: boolean
}

/**
 * Erreur API personnalisée
 */
/**
 * Structure de la réponse API (correspond au backend)
 */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  error?: {
    code: string
    details?: unknown
  }
  timestamp: string
}

export interface PaginationMeta {
  page: number
  total: number
  totalPages: number
}

/**
 * Réponse paginée générique
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationMeta
}

/**
 * Erreur API personnalisée
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: unknown,
    public code?: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Helper pour construire une URL complète de l'API
 */
export function buildApiUrl(endpoint: string): string {
  // Si l'endpoint commence par http:// ou https://, l'utiliser tel quel
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }

  // Sinon, construire l'URL à partir de la baseURL
  const baseUrl = env.VITE_API_URL.endsWith('/')
    ? env.VITE_API_URL
    : `${env.VITE_API_URL}/`
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

  return `${baseUrl}${path}`
}

/**
 * Fonction utilitaire principale pour les appels API
 *
 * @template TResponse - Type de la donnée attendue (le T dans ApiResponse<T>)
 * @param url - URL de l'endpoint (relative ou absolue)
 * @param method - Méthode HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param data - Données à envoyer (optionnel, ignoré pour GET)
 * @param config - Configuration additionnelle (optionnel)
 * @returns Promise avec la donnée typée TResponse
 */
export async function api<TResponse>(
  url: string,
  method: HttpMethod,
  data?: any,
  config?: ApiRequestConfig,
): Promise<TResponse> {
  const controller = new AbortController()
  const timeout = config?.timeout ?? apiConfig.timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // Récupérer le token d'authentification
    const token = localStorage.getItem('auth_token')

    // Construire les headers avec le token si disponible (en utilisant Headers pour éviter les problèmes de typage)
    const headers = new Headers()

    // Ajouter les headers par défaut
    Object.entries(apiConfig.headers).forEach(([key, value]) => {
      headers.set(key, value)
    })

    // Ajouter les headers optionnels transmis via config
    if (config?.headers) {
      if (config.headers instanceof Headers) {
        config.headers.forEach((value, key) => {
          headers.set(key, value)
        })
      } else if (Array.isArray(config.headers)) {
        for (const [key, value] of config.headers) {
          headers.set(key, value)
        }
      } else if (typeof config.headers === 'object') {
        Object.entries(config.headers as Record<string, string>).forEach(
          ([key, value]) => {
            headers.set(key, value)
          },
        )
      }
    }

    // Ajouter l'Authorization si besoin
    if (
      token &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/register')
    ) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    // Ajouter le session ID pour les invités
    const sessionId = localStorage.getItem('session_id')
    if (sessionId) {
      headers.set('x-session-id', sessionId)
    }

    const response = await fetch(buildApiUrl(url), {
      method,
      headers,
      body:
        data !== undefined && method !== 'GET'
          ? JSON.stringify(data)
          : undefined,
      credentials: config?.withCredentials ? 'include' : 'same-origin',
      signal: controller.signal,
      ...config,
    })

    // Nettoyer le timeout
    clearTimeout(timeoutId)

    // Gérer les erreurs HTTP
    if (!response.ok) {
      let errorData: any
      let errorMessage = `HTTP error! status: ${response.status}`
      let errorCode: string | undefined
      let errorDetails: any | undefined

      try {
        errorData = await response.json()
        // Extraire le message d'erreur du backend si disponible
        if (errorData && typeof errorData === 'object') {
          if ('message' in errorData) {
            errorMessage = errorData.message
          }
          if ('error' in errorData && typeof errorData.error === 'object') {
            errorCode = errorData.error.code
            errorDetails = errorData.error.details
          }
        }
      } catch {
        errorData = await response.text()
      }

      // Si 401 et qu'on a un refresh token, essayer de rafraîchir
      if (
        response.status === 401 &&
        !url.includes('/auth/refresh') &&
        !url.includes('/auth/login')
      ) {
        const refreshToken = localStorage.getItem('auth_refresh_token')

        if (refreshToken) {
          try {
            // Tenter de rafraîchir le token
            const refreshResponse = await fetch(buildApiUrl('/auth/refresh'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            })

            if (refreshResponse.ok) {
              const refreshData: ApiResponse<TokenPair> =
                await refreshResponse.json()

              // Sauvegarder les nouveaux tokens (adapté à la structure ApiResponse)
              const newTokens = refreshData.data

              if (newTokens?.accessToken) {
                localStorage.setItem('auth_token', newTokens.accessToken)

                if (newTokens.refreshToken) {
                  localStorage.setItem(
                    'auth_refresh_token',
                    newTokens.refreshToken,
                  )
                }

                // Réessayer la requête originale avec le nouveau token
                return api<TResponse>(url, method, data, config)
              }
            }
          } catch {
            // Si le refresh échoue, nettoyer et laisser l'erreur se propager
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_refresh_token')
            localStorage.removeItem('auth_user')
          }
        }
      }

      throw new ApiError(
        response.status,
        response.statusText,
        errorMessage,
        errorData,
        errorCode,
        errorDetails,
      )
    }

    // Vérifier s'il y a du contenu à parser
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      const jsonData: ApiResponse<TResponse> = await response.json()

      // Si la réponse suit la structure standard ApiResponse
      if (jsonData.success) {
        return jsonData.data as TResponse
      } else {
        // Cas rare où le status est 200 mais success est false
        throw new ApiError(
          200,
          'OK',
          jsonData.message,
          jsonData,
          jsonData.error?.code,
          jsonData.error?.details,
        )
      }
    }

    // Si pas de contenu JSON, retourner null
    return null as TResponse
  } catch (error) {
    clearTimeout(timeoutId)

    // Re-throw ApiError tel quel
    if (error instanceof ApiError) {
      throw error
    }

    // Gérer les erreurs d'abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        408,
        'Request Timeout',
        `Request timeout after ${timeout}ms`,
      )
    }

    // Autres erreurs
    throw error
  }
}

/**
 * Helpers pour chaque méthode HTTP (pour plus de concision)
 */
export const apiHelpers = {
  /**
   * GET request
   */
  get: <TResponse = unknown>(url: string, config?: ApiRequestConfig) =>
    api<TResponse>(url, 'GET', undefined, config),

  /**
   * POST request
   */
  post: <TResponse = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ) => api<TResponse>(url, 'POST', data, config),

  /**
   * PUT request
   */
  put: <TResponse = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ) => api<TResponse>(url, 'PUT', data, config),

  /**
   * PATCH request
   */
  patch: <TResponse = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig,
  ) => api<TResponse>(url, 'PATCH', data, config),

  /**
   * DELETE request
   */
  delete: <TResponse = unknown>(url: string, config?: ApiRequestConfig) =>
    api<TResponse>(url, 'DELETE', undefined, config),
}

// Export des helpers individuellement pour plus de flexibilité
export const { get, post, put, patch, delete: del } = apiHelpers
