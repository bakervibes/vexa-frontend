import { useHead, useSeoMeta } from '@unhead/vue'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

const SITE_NAME = import.meta.env.VITE_APP_NAME || 'Vexa'
const SITE_URL = import.meta.env.VITE_APP_URL || 'https://vexa.store'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`

export interface SeoConfig {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string>
  url?: MaybeRefOrGetter<string>
  type?: 'website' | 'article' | 'product'
  noIndex?: boolean
  canonical?: MaybeRefOrGetter<string>
}

/**
 * Composable pour la gestion du SEO
 */
export const useSeo = (config: SeoConfig) => {
  const title = computed(() => {
    const t = toValue(config.title)
    return t ? `${t} | ${SITE_NAME}` : SITE_NAME
  })

  const description = computed(
    () =>
      toValue(config.description) ||
      'Vexa - Votre boutique en ligne. Découvrez nos produits de qualité et profitez de nos offres exclusives.',
  )

  const image = computed(() => toValue(config.image) || DEFAULT_IMAGE)
  const url = computed(() => toValue(config.url) || SITE_URL)
  const canonical = computed(() => toValue(config.canonical) || url.value)

  useHead({
    title,
    link: [
      {
        rel: 'canonical',
        href: canonical,
      },
    ],
    meta: config.noIndex
      ? [{ name: 'robots', content: 'noindex, nofollow' }]
      : [],
  })

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url,
    ogType: config.type === 'product' ? 'website' : config.type || 'website',
    ogSiteName: SITE_NAME,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  })
}

/**
 * SEO pour une page produit
 */
export interface ProductSeoConfig {
  name: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string>
  price?: MaybeRefOrGetter<number>
  currency?: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
  brand?: string
  sku?: string
  url?: MaybeRefOrGetter<string>
}

export const useProductSeo = (config: ProductSeoConfig) => {
  const title = computed(() => toValue(config.name))
  const description = computed(() => toValue(config.description) || '')
  const image = computed(() => toValue(config.image) || DEFAULT_IMAGE)
  const price = computed(() => toValue(config.price) || 0)
  const url = computed(() => toValue(config.url) || SITE_URL)

  // Basic SEO
  useSeo({
    title,
    description,
    image,
    url,
    type: 'product',
  })

  // Product structured data (JSON-LD)
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: toValue(config.name),
            description: description.value,
            image: image.value,
            sku: config.sku,
            brand: config.brand
              ? {
                  '@type': 'Brand',
                  name: config.brand,
                }
              : undefined,
            offers: {
              '@type': 'Offer',
              price: price.value,
              priceCurrency: config.currency || 'EUR',
              availability: `https://schema.org/${config.availability || 'InStock'}`,
              url: url.value,
            },
          }),
        ),
      },
    ],
  })
}

/**
 * SEO pour une page catégorie/collection
 */
export interface CategorySeoConfig {
  name: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string>
  url?: MaybeRefOrGetter<string>
  itemCount?: MaybeRefOrGetter<number>
}

export const useCategorySeo = (config: CategorySeoConfig) => {
  const title = computed(() => toValue(config.name))
  const description = computed(
    () =>
      toValue(config.description) ||
      `Découvrez notre collection ${toValue(config.name)}`,
  )
  const image = computed(() => toValue(config.image) || DEFAULT_IMAGE)
  const url = computed(() => toValue(config.url) || SITE_URL)

  useSeo({
    title,
    description,
    image,
    url,
  })

  // Collection structured data (JSON-LD)
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: toValue(config.name),
            description: description.value,
            url: url.value,
            numberOfItems: toValue(config.itemCount) || undefined,
          }),
        ),
      },
    ],
  })
}

/**
 * Structured data pour l'organisation/site
 */
export const useOrganizationSchema = () => {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/logo.png`,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+33-1-00-00-00-00',
            contactType: 'customer service',
            availableLanguage: ['French', 'English'],
          },
          sameAs: [
            'https://www.facebook.com/vexa',
            'https://www.instagram.com/vexa',
            'https://twitter.com/vexa',
          ],
        }),
      },
    ],
  })
}

/**
 * Structured data pour breadcrumbs
 */
export interface BreadcrumbItem {
  name: string
  url: string
}

export const useBreadcrumbSchema = (
  items: MaybeRefOrGetter<BreadcrumbItem[]>,
) => {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: computed(() =>
          JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: toValue(items).map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.name,
              item: item.url,
            })),
          }),
        ),
      },
    ],
  })
}

/**
 * Structured data pour la recherche
 */
export const useSearchBoxSchema = () => {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        }),
      },
    ],
  })
}
