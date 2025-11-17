import { z } from 'zod'

/**
 * Schema de validation pour les variables d'environnement
 * Toutes les variables Vite doivent commencer par VITE_
 */
const envSchema = z.object({
  // Application
  VITE_APP_NAME: z.string().min(1, "Le nom de l'application est requis"),
  VITE_APP_VERSION: z.string().min(1, "La version de l'application est requise"),

  // API Configuration
  VITE_API_URL: z.string().url("L'URL de l'API doit être valide"),
  VITE_API_TIMEOUT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive('Le timeout doit être positif')),

  // Feature Flags
  VITE_ENABLE_DEV_TOOLS: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean()),
  VITE_ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean()),

  // Environment
  VITE_ENV: z.enum(['development', 'staging', 'production'], {
    message: "L'environnement doit être development, staging ou production",
  }),
})

/**
 * Type inféré depuis le schema Zod
 * Permet d'avoir l'autocomplétion et la vérification de types
 */
export type Env = z.infer<typeof envSchema>

/**
 * Valide et parse les variables d'environnement
 * Lance une erreur si la validation échoue
 */
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(import.meta.env)
    return parsed
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err: z.ZodIssue) => `  - ${err.path.join('.')}: ${err.message}`)
        .join('\n')

      throw new Error(
        `❌ Configuration des variables d'environnement invalide:\n\n${errorMessages}\n\nVérifiez votre fichier .env`,
      )
    }
    throw error
  }
}

/**
 * Variables d'environnement validées et typées
 * Utilisez cet export dans toute l'application
 *
 * @example
 * import { env } from '@/env'
 *
 * const apiUrl = env.VITE_API_URL
 * const timeout = env.VITE_API_TIMEOUT
 */
export const env = validateEnv()

/**
 * Helper pour vérifier si on est en développement
 */
export const isDevelopment = env.VITE_ENV === 'development'

/**
 * Helper pour vérifier si on est en production
 */
export const isProduction = env.VITE_ENV === 'production'

/**
 * Helper pour vérifier si on est en staging
 */
export const isStaging = env.VITE_ENV === 'staging'
