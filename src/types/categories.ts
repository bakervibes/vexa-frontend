import type { Category, Product } from './models'

/**
 * Catégorie avec relations parent/enfants et compteur produits
 * Correspond au retour de getAll et getBestSelling
 */
export interface CategoryWithChildren extends Category {
  parentCategory: Category | null
  childCategories: Category[]
  _count: {
    products: number
  }
}

/**
 * Catégorie avec produits preview
 * Correspond au retour de getOne (page catégorie individuelle)
 */
export interface CategoryWithProducts extends CategoryWithChildren {
  products: Product[]
}

/**
 * Réponse pour getAll et getBestSelling
 */
export type CategoriesResponse = CategoryWithChildren[]

/**
 * Réponse pour getOne
 */
export type CategoryDetailResponse = CategoryWithProducts

/**
 * Réponse pour create et update
 * Aligned with backend Prisma relations:
 * - parentCategory (not parent)
 */
export interface CategoryResponse extends Category {
  parentCategory: Category | null
}
