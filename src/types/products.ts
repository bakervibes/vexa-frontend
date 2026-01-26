import type { PaginationMeta } from '@/utils/api'
import type {
  Attribute,
  Category,
  Option,
  Product,
  ProductVariant,
  ProductVariantOption,
} from './models'
import type { ReviewWithUser } from './reviews'

// ============================================
// PRODUCT VARIANT OPTION DETAILS
// ============================================

export interface ProductVariantOptionWithDetails extends ProductVariantOption {
  option: Option & {
    attribute: Attribute
  }
}

// ============================================
// PRODUCT VARIANT DETAILS
// ============================================

export interface ProductVariantWithDetails extends ProductVariant {
  productVariantOptions: ProductVariantOptionWithDetails[]
}

// ============================================
// REVIEW RATING (pour les listes de produits)
// ============================================

/**
 * Rating simplifié pour le calcul des moyennes
 */
export interface ReviewRating {
  rating: number
}

// ============================================
// PRODUCT WITH DETAILS (pour listes: getAll, getFeatured, getRelated, getByCategory)
// ============================================

/**
 * Produit avec détails pour les listes
 * Inclut category, variants avec options, et les métriques de review
 * Note: reviews est optionnel car seule la page de détail inclut les reviews complètes
 */
export interface ProductWithDetails extends Product {
  category: Category
  productVariants: ProductVariantWithDetails[]
  productReviews?: ReviewWithUser[]
  averageRating: number
  reviewCount: number
}

// ============================================
// API RESPONSES
// ============================================

/**
 * Réponse pour getAll et getByCategory
 */
export interface ProductsResponse {
  data: ProductWithDetails[]
  meta: PaginationMeta
}
