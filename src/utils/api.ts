import { env } from '@/env'
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

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
export interface ApiRequestConfig extends AxiosRequestConfig {
  /** Timeout personnalisé (en ms) */
  timeout?: number
  /** Inclure les credentials (cookies) */
  withCredentials?: boolean
}

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
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

/**
 * Réponse paginée générique
 */
export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
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
 * Helper pour construire une URL complète de l'API (pour compatibilité ou usage externe)
 */
export function buildApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }
  const baseUrl = env.VITE_API_URL.endsWith('/')
    ? env.VITE_API_URL
    : `${env.VITE_API_URL}/`
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${baseUrl}${path}`
}

/**
 * Helper pour récupérer le session_id depuis localStorage
 */
function getSessionId(): string | null {
  return localStorage.getItem('session_id')
}

/**
 * Instance Axios configurée
 * withCredentials: true permet d'envoyer/recevoir les cookies httpOnly (session better-auth)
 */
const axiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: apiConfig.headers,
  withCredentials: true,
})

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Ajouter le session_id pour les utilisateurs guests (panier, wishlist)
    const sessionId = getSessionId()
    if (sessionId) {
      config.headers.set('x-session-id', sessionId)
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  async (response: AxiosResponse) => {
    const data = response.data

    // Vérifier si la réponse suit la structure standard ApiResponse du backend
    // Le backend NestJS retourne { statusCode, message, data }
    if (data && typeof data === 'object') {
      // Format NestJS: { statusCode, message, data }
      if ('statusCode' in data && 'data' in data) {
        return data.data
      }

      // Format alternatif: { success, message, data }
      if ('success' in data) {
        const apiRes = data as ApiResponse<unknown>
        if (apiRes.success) {
          return apiRes.data
        } else {
          // Erreur métier renvoyée avec un status 200
          throw new ApiError(
            200,
            'OK',
            apiRes.message,
            apiRes,
            apiRes.error?.code,
            apiRes.error?.details,
          )
        }
      }
    }

    // Si la structure n'est pas standard, retourner les données telles quelles
    return data
  },
  async (error: AxiosError) => {
    // Transformer AxiosError en ApiError
    let message = error.message
    const data = error.response?.data
    let code: string | undefined
    let details: unknown | undefined

    if (data && typeof data === 'object') {
      const errData = data as Record<string, unknown>
      if (errData.message) message = errData.message as string
      const errorObj = errData.error as Record<string, unknown> | undefined
      if (errorObj?.code) code = errorObj.code as string
      if (errorObj?.details) details = errorObj.details
    }

    throw new ApiError(
      error.response?.status ?? 0,
      error.response?.statusText ?? 'Network Error',
      message,
      data,
      code,
      details,
    )
  },
)

/**
 * Fonction utilitaire principale pour les appels API
 *
 * @template TResponse - Type de la donnée attendue
 * @param url - URL de l'endpoint
 * @param method - Méthode HTTP
 * @param data - Données à envoyer
 * @param config - Configuration additionnelle
 * @returns Promise avec la donnée typée TResponse
 */
export async function api<TResponse>(
  url: string,
  method: HttpMethod,
  data?: unknown,
  config?: ApiRequestConfig,
): Promise<TResponse> {
  const requestConfig: AxiosRequestConfig = {
    url,
    method,
    data,
    ...config,
  }

  // Axios retourne AxiosResponse dans le type, mais notre intercepteur retourne les données.
  // On utilise 'as any' pour bypasser la contrainte de typage de axios.
  return axiosInstance.request(requestConfig) as Promise<TResponse>
}
