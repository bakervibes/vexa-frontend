import type { Review, User } from './models'

/**
 * Review avec informations utilisateur pour l'affichage public
 * Correspond exactement au retour de getReviews du backend
 */
export interface ReviewWithUser extends Review {
  user: Pick<User, 'id' | 'name' | 'image'>
}
