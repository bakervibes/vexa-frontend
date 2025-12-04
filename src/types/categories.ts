import type { Category, Product } from './models'

/**
 * Catégorie avec relations parent/enfants et compteur produits
 * Correspond au retour de getAll et getBestSelling
 */
export interface CategoryWithChildren extends Category {
  parent: Category | null
  children: Category[]
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
 */
export interface CategoryResponse extends Category {
  parent: Category | null
}
