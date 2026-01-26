import type { ProductReview, User } from './models'

/**
 * Review avec informations utilisateur pour l'affichage public
 * Correspond exactement au retour de getReviews du backend
 */
export interface ReviewWithUser extends ProductReview {
  user: Pick<User, 'id' | 'name' | 'image'>
}
