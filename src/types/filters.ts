// ============================================
// FILTERS TYPES
// ============================================

/**
 * Category for filter display
 */
export interface FilterCategory {
  id: string
  name: string
  slug: string
  image: string
}

/**
 * Option within an attribute
 */
export interface FilterOption {
  id: string
  name: string
  slug: string
}

/**
 * Attribute with its options
 */
export interface FilterAttribute {
  id: string
  name: string
  slug: string
  options: FilterOption[]
}

/**
 * Price range
 */
export interface PriceRange {
  min: number
  max: number
}

/**
 * Full filters response from API
 */
export interface FiltersResponse {
  categories: FilterCategory[]
  attributes: FilterAttribute[]
  priceRange: PriceRange
}

/**
 * Selected attribute option (for filtering)
 * Key is attribute slug, value is option slug
 */
export type SelectedAttributeOption = Record<string, string>
