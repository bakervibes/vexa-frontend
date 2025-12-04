import type { User } from './models'

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: TokenPair
}
