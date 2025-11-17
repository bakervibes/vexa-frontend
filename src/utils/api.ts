import { env } from '@/env'

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
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
    public data?: unknown,
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
  const baseUrl = env.VITE_API_URL.endsWith('/') ? env.VITE_API_URL : `${env.VITE_API_URL}/`
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

  return `${baseUrl}${path}`
}

/**
 * Fonction utilitaire principale pour les appels API
 *
 * @template TResponse - Type de la réponse attendue
 * @param url - URL de l'endpoint (relative ou absolue)
 * @param method - Méthode HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param data - Données à envoyer (optionnel, ignoré pour GET)
 * @param config - Configuration additionnelle (optionnel)
 * @returns Promise avec la réponse typée
 *
 * @example
 * ```ts
 * // GET request
 * const users = await api<User[]>('/users', 'GET')
 *
 * // POST request avec data
 * const newUser = await api<User>('/users', 'POST', { name: 'John' })
 *
 * // PUT request avec config
 * const updated = await api<User>('/users/1', 'PUT', { name: 'Jane' }, {
 *   headers: { 'X-Custom': 'value' },
 *   timeout: 5000
 * })
 * ```
 */
export async function api<TResponse = unknown>(
  url: string,
  method: HttpMethod,
  data?: unknown,
  config?: ApiRequestConfig,
): Promise<TResponse> {
  const controller = new AbortController()
  const timeout = config?.timeout ?? apiConfig.timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(buildApiUrl(url), {
      method,
      headers: {
        ...apiConfig.headers,
        ...config?.headers,
      },
      body: data !== undefined && method !== 'GET' ? JSON.stringify(data) : undefined,
      credentials: config?.withCredentials ? 'include' : 'same-origin',
      signal: controller.signal,
      ...config,
    })

    // Nettoyer le timeout
    clearTimeout(timeoutId)

    // Gérer les erreurs HTTP
    if (!response.ok) {
      let errorData: unknown
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }

      throw new ApiError(
        response.status,
        response.statusText,
        `HTTP error! status: ${response.status}`,
        errorData,
      )
    }

    // Vérifier s'il y a du contenu à parser
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return await response.json()
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
      throw new ApiError(408, 'Request Timeout', `Request timeout after ${timeout}ms`)
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
  post: <TResponse = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    api<TResponse>(url, 'POST', data, config),

  /**
   * PUT request
   */
  put: <TResponse = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    api<TResponse>(url, 'PUT', data, config),

  /**
   * PATCH request
   */
  patch: <TResponse = unknown>(url: string, data?: unknown, config?: ApiRequestConfig) =>
    api<TResponse>(url, 'PATCH', data, config),

  /**
   * DELETE request
   */
  delete: <TResponse = unknown>(url: string, config?: ApiRequestConfig) =>
    api<TResponse>(url, 'DELETE', undefined, config),
}

// Export des helpers individuellement pour plus de flexibilité
export const { get, post, put, patch, delete: del } = apiHelpers
