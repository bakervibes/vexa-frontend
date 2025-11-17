/**
 * Type pour un utilisateur
 */
export interface User {
  id: number
  name: string
  email: string
  username: string
  phone?: string
  website?: string
}

/**
 * Type pour créer un utilisateur
 */
export type CreateUserDto = Omit<User, 'id'>

/**
 * Type pour mettre à jour un utilisateur
 */
export type UpdateUserDto = Partial<CreateUserDto>
