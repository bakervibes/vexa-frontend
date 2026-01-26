import { env } from '@/env'
import type { User } from '@/types/models'
import { twoFactorClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'
import { computed } from 'vue'

/**
 * Better-auth client for Vue.js
 * Uses sessions (httpOnly cookies) instead of JWT/localStorage
 */
export const authClient = createAuthClient({
  baseURL: `${env.VITE_API_URL}/auth`,
  fetchOptions: {
    credentials: 'include',
  },
  plugins: [twoFactorClient()],
})

// Direct exports for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  requestPasswordReset: forgetPassword,
  resetPassword,
  changeEmail,
  changePassword,
  updateUser,
  deleteUser,
  getSession,
  twoFactor,
} = authClient

/**
 * Composable to access user session data
 * Provides typed access to user and session state
 */
export function useUser() {
  const session = useSession()

  return {
    user: computed(
      () => (session.value?.data?.user as User | undefined) ?? null,
    ),
    session: computed(() => session.value?.data?.session ?? null),
    isPending: computed(
      () => session.value?.isPending || session.value.isRefetching,
    ),
    error: computed(() => session.value?.error),
  }
}

export async function getUser() {
  const { data, error } = await getSession()

  if (error || !data?.user) {
    return null
  }

  return data?.user as User
}
