import type { Attribute, AttributeOption } from '@/services/attributes.service'

/**
 * Interface pour une variante en entrée (formulaire)
 * combinationKey est un identifiant stable basé sur les option IDs triés
 */
export interface VariantInput {
  combinationKey: string
  options: { optionId: string }[]
  basePrice: number
  price?: number
  stock: number
}

/**
 * Interface pour une option sélectionnée avec son attribut
 */
export interface SelectedOption {
  attributeId: string
  attributeName: string
  optionId: string
  optionName: string
}

/**
 * Interface pour un attribut avec ses options (alias pour clarté)
 */
export type AttributeWithOptions = Attribute

/**
 * Composable pour la gestion des combinaisons de variantes produit
 */
export function useProductVariants() {
  /**
   * Génère une clé de combinaison stable et déterministe
   * Les option IDs sont triés alphabétiquement et joints par un pipe
   *
   * @param optionIds - Liste des option IDs
   * @returns Clé de combinaison (ex: "optId1|optId2|optId3")
   */
  function generateCombinationKey(optionIds: string[]): string {
    return [...optionIds].sort().join('|')
  }

  /**
   * Génère le produit cartésien de plusieurs tableaux
   */
  function cartesianProduct<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) return [[]]

    return arrays.reduce<T[][]>(
      (acc, curr) => {
        const result: T[][] = []
        acc.forEach((accItem) => {
          curr.forEach((currItem) => {
            result.push([...accItem, currItem])
          })
        })
        return result
      },
      [[]],
    )
  }

  /**
   * Génère toutes les combinaisons de variantes à partir des attributs/options sélectionnés
   *
   * @param selectedAttributes - Map<attributeId, Set<optionId>>
   * @param attributes - Liste des attributs avec leurs options
   * @returns Tableau de variantes avec stock initial à 0 et combinationKey généré
   */
  function generateCombinations(
    selectedAttributes: Map<string, Set<string>>,
    _attributes: AttributeWithOptions[],
  ): VariantInput[] {
    const entries = Array.from(selectedAttributes.entries()).filter(
      ([, optionIds]) => optionIds.size > 0,
    )

    if (entries.length === 0) return []

    // Construire les tableaux d'options pour le produit cartésien
    const optionArrays: { optionId: string }[][] = entries.map(
      ([, optionIds]) => {
        return Array.from(optionIds).map((optionId) => ({ optionId }))
      },
    )

    // Générer le produit cartésien
    const combinations = cartesianProduct(optionArrays)

    return combinations.map((combo) => {
      const optionIds = combo.map((o) => o.optionId)
      return {
        combinationKey: generateCombinationKey(optionIds),
        options: combo,
        basePrice: 0,
        price: undefined,
        stock: 0,
      }
    })
  }

  /**
   * Génère le label d'une combinaison de variante
   *
   * @param options - Liste des options de la variante
   * @param _attributes - Liste des attributs avec leurs options (utilisé pour lookup)
   * @returns Label formaté (ex: "Couleur: Rouge / Taille: M")
   */
  function getCombinationLabel(
    options: { optionId: string }[],
    attributes: AttributeWithOptions[],
  ): string {
    return options
      .map((opt) => {
        for (const attr of attributes) {
          const option = attr.options.find((o) => o.id === opt.optionId)
          if (option) {
            return `${attr.name}: ${option.name}`
          }
        }
        return opt.optionId
      })
      .join(' / ')
  }

  /**
   * Récupère les détails d'une option par son ID
   */
  function getOptionDetails(
    optionId: string,
    attributes: AttributeWithOptions[],
  ): SelectedOption | null {
    for (const attr of attributes) {
      const option = attr.options?.find(
        (o: AttributeOption) => o.id === optionId,
      )
      if (option) {
        return {
          attributeId: attr.id,
          attributeName: attr.name,
          optionId: option.id,
          optionName: option.name,
        }
      }
    }
    return null
  }

  /**
   * Récupère le nom d'une option par son ID
   */
  function getOptionName(
    optionId: string,
    attributes: AttributeWithOptions[],
  ): string {
    for (const attr of attributes) {
      const option = attr.options?.find(
        (o: AttributeOption) => o.id === optionId,
      )
      if (option) return option.name
    }
    return optionId
  }

  /**
   * Calcule le nombre total de combinaisons possibles
   */
  function getCombinationsCount(
    selectedAttributes: Map<string, Set<string>>,
  ): number {
    const entries = Array.from(selectedAttributes.entries()).filter(
      ([, optionIds]) => optionIds.size > 0,
    )

    if (entries.length === 0) return 0

    return entries.reduce((acc, [, optionIds]) => acc * optionIds.size, 1)
  }

  /**
   * Vérifie si le nombre de combinaisons est trop élevé
   */
  function isCombinationsCountHigh(
    selectedAttributes: Map<string, Set<string>>,
    threshold = 100,
  ): boolean {
    return getCombinationsCount(selectedAttributes) > threshold
  }

  /**
   * Trouve l'attribut qui contient une option donnée
   *
   * @param optionId - ID de l'option à rechercher
   * @param attributes - Liste des attributs avec leurs options
   * @returns L'attribut contenant l'option ou null si non trouvé
   */
  function findAttributeForOption(
    optionId: string,
    attributes: AttributeWithOptions[],
  ): AttributeWithOptions | null {
    for (const attr of attributes) {
      if (attr.options?.some((o) => o.id === optionId)) {
        return attr
      }
    }
    return null
  }

  return {
    generateCombinationKey,
    generateCombinations,
    getCombinationLabel,
    getOptionDetails,
    getOptionName,
    getCombinationsCount,
    isCombinationsCountHigh,
    findAttributeForOption,
  }
}
