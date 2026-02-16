<script setup lang="ts">
import CustomBreadcrumb from '@/components/custom/custom-breadcrumb.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useCarts } from '@/composables/useCarts'
import { useProduct } from '@/composables/useProducts'
import { useBreadcrumbSchema, useProductSeo } from '@/composables/useSeo'
import { useWishlists } from '@/composables/useWishlists'
import type { ProductVariantWithDetails } from '@/types/products'
import { formatPrice } from '@/utils/lib'
import { HeartIcon, Minus, Plus } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import ProductRating from '../common/ProductRating.vue'

const props = defineProps<{
  slug: string
  isModal?: boolean
}>()

const route = useRoute()
const router = useRouter()

const { isModal = false } = props
const { product, isLoadingProduct, isErrorProduct } = useProduct(
  () => props.slug,
)
const { addCartItem, isAddingCartItem } = useCarts()
const {
  addWishlistItem,
  isAddingToWishlist,
  removeWishlistItem,
  isRemovingWishlistItem,
  wishlistItems,
} = useWishlists()

if (!props.isModal) {
  const siteUrl = import.meta.env.VITE_APP_URL || 'https://vexa.store'

  useProductSeo({
    name: () => product.value?.name || '',
    description: () => product.value?.description || '',
    image: () => product.value?.images?.[0] || '',
    price: () => product.value?.price || product.value?.basePrice || 0,
    currency: 'EUR',
    availability: (product.value?.stock || 0) > 0 ? 'InStock' : 'OutOfStock',
    url: () => `${siteUrl}/products/${props.slug}`,
  })

  useBreadcrumbSchema(
    computed(() => [
      { name: 'Accueil', url: siteUrl },
      { name: 'Boutique', url: `${siteUrl}/shop` },
      {
        name: product.value?.name || 'Produit',
        url: `${siteUrl}/products/${props.slug}`,
      },
    ]),
  )
}

const isInWishlist = computed(() => {
  return wishlistItems.value.some(
    (item) =>
      item.product.id === product.value?.id &&
      item.productVariant?.id === currentVariant.value?.id,
  )
})

const selectedImageIndex = ref(0)
const quantity = ref(1)

const selectedOptions = ref<Record<string, string>>({})

const availableAttributes = computed(() => {
  if (!product.value?.productVariants) return []

  const attributesMap = new Map<
    string,
    {
      id: string
      name: string
      slug: string
      options: Map<string, { id: string; name: string; value: string }>
    }
  >()

  product.value.productVariants.forEach((variant) => {
    variant.productVariantOptions.forEach((pvo) => {
      const attr = pvo.option.attribute
      const opt = pvo.option

      if (!attributesMap.has(attr.id)) {
        attributesMap.set(attr.id, {
          id: attr.id,
          name: attr.name,
          slug: attr.slug,
          options: new Map(),
        })
      }

      const attrGroup = attributesMap.get(attr.id)!
      if (!attrGroup.options.has(opt.id)) {
        attrGroup.options.set(opt.id, {
          id: opt.id,
          name: opt.name,
          value: opt.name,
        })
      }
    })
  })

  return Array.from(attributesMap.values()).map((attr) => ({
    ...attr,
    options: Array.from(attr.options.values()),
  }))
})

const hasVariants = computed(() => {
  return availableAttributes.value.length > 0
})

const currentVariant = computed<ProductVariantWithDetails | undefined>(() => {
  if (!product.value?.productVariants || !hasVariants.value) return undefined

  if (
    Object.keys(selectedOptions.value).length !==
    availableAttributes.value.length
  ) {
    return undefined
  }

  return product.value.productVariants.find((variant) => {
    if (
      variant.productVariantOptions.length !==
      Object.keys(selectedOptions.value).length
    ) {
      return false
    }

    return variant.productVariantOptions.every((pvo) => {
      return selectedOptions.value[pvo.option.attribute.id] === pvo.option.id
    })
  })
})

const hasIncompleteSelection = computed(() => {
  return hasVariants.value && !currentVariant.value
})

const canShowPriceAndStock = computed(() => {
  if (!hasVariants.value) return true
  return currentVariant.value !== undefined
})

const currentPrice = computed(() => {
  if (hasVariants.value && currentVariant.value) {
    return currentVariant.value.price ?? currentVariant.value.basePrice
  }
  return product.value?.price ?? product.value?.basePrice ?? 0
})

const currentBasePrice = computed(() => {
  if (hasVariants.value && currentVariant.value) {
    return currentVariant.value.basePrice
  }
  return product.value?.basePrice ?? 0
})

const currentStock = computed(() => {
  if (hasVariants.value && currentVariant.value) {
    return currentVariant.value.stock ?? 0
  }
  return product.value?.stock ?? 0
})

const isOutOfStock = computed(() => {
  return currentStock.value <= 0
})

const maxQuantity = computed(() => {
  return Math.max(1, currentStock.value)
})

const hasDiscount = computed(() => {
  if (!canShowPriceAndStock.value) return false

  if (!currentPrice.value || !currentBasePrice.value) return false

  if (currentPrice.value >= currentBasePrice.value) return false

  const expirationDate =
    currentVariant.value?.expiresAt || product.value?.expiresAt

  if (expirationDate) {
    const expiresAt = new Date(expirationDate)
    if (expiresAt <= new Date()) return false
  }

  return true
})

const currentImage = computed(() => {
  if (!product.value?.images || product.value.images.length === 0)
    return '/placeholder.png'
  return product.value.images[selectedImageIndex.value]
})

const optionsInitialized = ref(false)
const lastInitializedProductId = ref<string | null>(null)

watch(
  () => props.slug,
  (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      selectedImageIndex.value = 0
      quantity.value = 1
      selectedOptions.value = {}
      optionsInitialized.value = false
      lastInitializedProductId.value = null
    }
  },
  { immediate: false },
)

const initSelectedOptions = () => {
  if (!product.value || !hasVariants.value) return

  if (
    optionsInitialized.value &&
    lastInitializedProductId.value === product.value.id
  ) {
    return
  }

  if (isModal) {
    selectedOptions.value = {}
    optionsInitialized.value = true
    lastInitializedProductId.value = product.value.id
    return
  }

  const newSelection: Record<string, string> = {}

  availableAttributes.value.forEach((attr) => {
    const queryValue = route.query[attr.name] as string
    if (queryValue) {
      const option = attr.options.find((o) => o.name === queryValue)
      if (option) {
        newSelection[attr.id] = option.id
      }
    }
  })

  selectedOptions.value = newSelection
  optionsInitialized.value = true
  lastInitializedProductId.value = product.value.id
}

const updateUrl = () => {
  if (isModal) return

  const query: Record<string, string> = { ...route.query } as Record<
    string,
    string
  >

  availableAttributes.value.forEach((attr) => {
    const selectedOptionId = selectedOptions.value[attr.id]
    if (selectedOptionId) {
      const selectedOption = attr.options.find((o) => o.id === selectedOptionId)
      if (selectedOption) {
        query[attr.name] = selectedOption.name
      }
    } else {
      delete query[attr.name]
    }
  })

  router.replace({ query, params: route.params })
}

const selectOption = (attributeId: string, optionId: string) => {
  if (selectedOptions.value[attributeId] === optionId) {
    const newSelection = { ...selectedOptions.value }
    delete newSelection[attributeId]
    selectedOptions.value = newSelection
  } else {
    selectedOptions.value = {
      ...selectedOptions.value,
      [attributeId]: optionId,
    }
  }
  updateUrl()
}

watch(
  product,
  () => {
    initSelectedOptions()
  },
  { immediate: true },
)

watch([currentVariant, currentStock], () => {
  if (quantity.value > maxQuantity.value) {
    quantity.value = 1
  }

  calculateTimeLeft()
})

const incrementQuantity = () => {
  if (quantity.value < maxQuantity.value) {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleaddCartItem = async () => {
  if (isOutOfStock.value) {
    toast.error('Ce produit est en rupture de stock')
    return
  }

  if (hasVariants.value && !currentVariant.value) {
    toast.error('Veuillez sélectionner toutes les options')
    return
  }

  if (!product.value?.id) {
    toast.error("Erreur lors de l'ajout au panier")
    return
  }

  await addCartItem(product.value.id, quantity.value, currentVariant.value?.id)
  quantity.value = 1
}

const handleToggleWishlist = async () => {
  if (!product.value?.id) {
    toast.error('Veuillez sélectionner un produit')
    return
  }

  if (isAddingToWishlist.value || isRemovingWishlistItem.value) {
    return
  }

  if (isInWishlist.value) {
    await removeWishlistItem(product.value.id, currentVariant.value?.id)
  } else {
    await addWishlistItem(product.value.id, currentVariant.value?.id)
  }
}

const timeLeft = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
})

let intervalId: number | null = null

const calculateTimeLeft = () => {
  const expirationDate =
    currentVariant.value?.expiresAt || product.value?.expiresAt

  if (!expirationDate) {
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return
  }

  const expiresAt = new Date(expirationDate).getTime()
  const now = new Date().getTime()
  const difference = expiresAt - now

  if (difference > 0) {
    timeLeft.value = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  } else {
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }
}

const discount = computed(() => {
  if (!currentPrice.value || !currentBasePrice.value) return 0

  return Math.round(
    ((currentBasePrice.value - currentPrice.value) / currentBasePrice.value) *
      100,
  )
})

const isNew = computed(() => {
  if (!product.value?.createdAt) return false
  const now = new Date()
  const createdAt = new Date(product.value.createdAt)
  return now.getTime() - createdAt.getTime() < 30 * 24 * 60 * 60 * 1000
})

onMounted(() => {
  calculateTimeLeft()
  intervalId = window.setInterval(calculateTimeLeft, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div
    v-if="isLoadingProduct"
    class="flex justify-center py-20"
  >
    <div
      class="h-12 w-12 animate-spin border-2 border-[#1E1E1E] border-t-[#C8A97E]"
    />
  </div>

  <div
    v-else-if="isErrorProduct"
    class="py-20 text-center text-[#C8A97E]"
  >
    Erreur lors du chargement du produit.
  </div>

  <div
    v-else-if="product"
    :class="isModal ? 'px-2 py-4' : 'mx-auto max-w-6xl px-6 py-16'"
  >
    <nav
      v-if="!isModal"
      class="mb-8 flex items-center gap-2 text-xs tracking-widest text-[#555] uppercase"
    >
      <CustomBreadcrumb
        :items="[
          { label: 'Accueil', link: '/' },
          { label: 'Boutique', link: '/shop' },
          {
            label: product?.category?.name ?? 'Catégorie',
            link: `/shop?categories=${product?.category?.slug}`,
          },
          {
            label: product?.name ?? 'Produit',
            link: `/products/${product?.slug}`,
          },
        ]"
      />
    </nav>

    <div
      :class="[
        'flex flex-col gap-12',
        isModal ? 'items-stretch lg:flex-col' : 'items-stretch lg:flex-row',
      ]"
    >
      <div
        :class="[
          'flex w-full flex-col gap-2',
          !isModal && 'lg:h-full lg:w-1/2',
        ]"
      >
        <div :class="[isModal ? 'block' : 'block lg:hidden']">
          <Carousel>
            <CarouselPrevious
              class="hover:bg-surface border-[#1E1E1E] bg-[#0A0A0A] text-[#C8A97E]"
            />
            <CarouselContent>
              <CarouselItem
                v-for="(image, index) in product.images"
                :key="index"
                class="sm:basis-1/2 lg:basis-1/3"
              >
                <div
                  class="bg-surface relative flex aspect-square w-full items-center justify-center overflow-hidden border border-[#1E1E1E]"
                >
                  <div
                    class="absolute top-3 left-3 z-10 flex flex-col items-stretch gap-2"
                  >
                    <span
                      v-if="isNew"
                      class="border border-[#C8A97E]/40 bg-[#0A0A0A]/90 px-2 py-1 text-[10px] tracking-widest text-[#C8A97E] uppercase backdrop-blur-sm"
                    >
                      Nouveau
                    </span>
                    <span
                      v-if="discount !== 0"
                      class="bg-[#C8A97E] px-2 py-1 text-[10px] tracking-widest text-[#0A0A0A] uppercase"
                    >
                      -{{ discount }}%
                    </span>
                  </div>

                  <div
                    v-if="index === 0"
                    class="absolute top-3 right-3 z-10"
                  >
                    <button
                      :disabled="isAddingToWishlist || isRemovingWishlistItem"
                      @click="handleToggleWishlist"
                      class="border border-[#1E1E1E] bg-[#0A0A0A]/90 p-2 backdrop-blur-sm transition-all hover:border-[#C8A97E]/40 disabled:opacity-50"
                    >
                      <HeartIcon
                        class="size-5 text-[#555] transition-colors hover:text-[#C8A97E]"
                        :class="isInWishlist && 'fill-[#C8A97E] text-[#C8A97E]'"
                      />
                    </button>
                  </div>

                  <img
                    :src="image"
                    :alt="`${product.name} vue ${index + 1}`"
                    class="h-full w-full object-cover opacity-90"
                  />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselNext
              class="hover:bg-surface border-[#1E1E1E] bg-[#0A0A0A] text-[#C8A97E]"
            />
          </Carousel>
        </div>

        <div
          v-if="!isModal"
          class="hidden lg:flex lg:h-full lg:flex-col lg:gap-4"
        >
          <div
            class="bg-surface relative flex aspect-square w-full flex-1 items-center justify-center overflow-hidden border border-[#1E1E1E]"
          >
            <div class="absolute top-3 left-3 z-10 flex flex-col gap-2">
              <span
                v-if="isNew"
                class="border border-[#C8A97E]/40 bg-[#0A0A0A]/90 px-2 py-1 text-[10px] tracking-widest text-[#C8A97E] uppercase backdrop-blur-sm"
              >
                Nouveau
              </span>
              <span
                v-if="discount !== 0"
                class="bg-[#C8A97E] px-2 py-1 text-[10px] tracking-widest text-[#0A0A0A] uppercase"
              >
                -{{ discount }}%
              </span>
            </div>

            <div class="absolute top-3 right-3 z-10">
              <button
                :disabled="isAddingToWishlist || isRemovingWishlistItem"
                @click="handleToggleWishlist"
                class="border border-[#1E1E1E] bg-[#0A0A0A]/90 p-2 backdrop-blur-sm transition-all hover:border-[#C8A97E]/40 disabled:opacity-50"
              >
                <HeartIcon
                  class="size-6 text-[#555] transition-colors hover:text-[#C8A97E]"
                  :class="isInWishlist && 'fill-[#C8A97E] text-[#C8A97E]'"
                />
              </button>
            </div>

            <img
              :src="currentImage"
              :alt="product.name"
              class="h-full w-full object-cover opacity-90"
            />
          </div>

          <div
            class="grid grid-cols-4 gap-3 p-1 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5"
          >
            <button
              v-for="(img, index) in product.images"
              :key="index"
              @click="selectedImageIndex = index"
              type="button"
              class="relative aspect-square w-full shrink-0 cursor-pointer overflow-hidden border transition-colors"
              :class="
                selectedImageIndex === index
                  ? 'border-[#C8A97E]'
                  : 'border-[#1E1E1E] hover:border-[#C8A97E]/40'
              "
            >
              <img
                :src="img"
                :alt="`${product.name} vue ${index + 1}`"
                class="h-full w-full object-cover opacity-80"
              />
            </button>
          </div>
        </div>
      </div>

      <div :class="['flex w-full flex-col pb-2', !isModal && 'lg:w-1/2']">
        <div class="mb-6 flex flex-col space-y-4">
          <div class="flex items-center gap-4">
            <ProductRating :rating="product.averageRating || 0" />
            <span class="text-xs text-[#555]">
              {{ product.reviewCount }} avis
            </span>
          </div>

          <h1
            class="font-display text-4xl font-light text-[#E8E8E8] md:text-5xl"
          >
            {{ product.name }}
          </h1>

          <div
            v-if="canShowPriceAndStock"
            class="flex flex-col gap-4"
          >
            <div class="flex items-center gap-4">
              <span class="font-display text-4xl font-light text-[#C8A97E]">
                {{ formatPrice(currentPrice) }}
              </span>
              <span
                v-if="hasDiscount"
                class="text-xl text-[#555] line-through"
              >
                {{ formatPrice(currentBasePrice) }}
              </span>
            </div>

            <div
              v-if="isOutOfStock"
              class="text-xs tracking-widest text-[#C8A97E] uppercase"
            >
              Rupture de stock
            </div>
            <div
              v-else-if="currentStock < 10"
              class="text-xs tracking-widest text-[#C8A97E] uppercase"
            >
              Plus que {{ currentStock }} en stock
            </div>
            <div
              v-else
              class="text-xs tracking-widest text-[#555] uppercase"
            >
              En stock ({{ currentStock }} disponibles)
            </div>
          </div>

          <div
            v-if="hasIncompleteSelection"
            class="bg-surface border border-[#C8A97E]/40 p-4 text-xs tracking-widest text-[#C8A97E] uppercase"
          >
            Veuillez sélectionner toutes les options.
          </div>

          <div class="space-y-2 pt-4">
            <h3 class="text-sm tracking-[0.3em] text-[#C8A97E] uppercase">
              Description
            </h3>
            <p class="leading-relaxed text-[#555]">
              {{ product.description }}
            </p>
          </div>
        </div>

        <div class="mb-6 h-px w-full bg-[#1E1E1E]" />

        <div
          v-if="hasDiscount"
          class="mb-6"
        >
          <p class="mb-4 text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
            Offre expire dans :
          </p>
          <div class="flex items-center gap-2">
            <div class="flex flex-col items-center">
              <span
                class="flex h-14 w-14 items-center justify-center border border-[#1E1E1E] text-2xl font-light text-[#C8A97E] md:h-16 md:w-16 md:text-3xl"
              >
                {{ timeLeft.days.toString().padStart(2, '0') }}
              </span>
              <span
                class="mt-2 text-[10px] tracking-widest text-[#555] uppercase"
              >
                Jours
              </span>
            </div>

            <span class="mb-7 text-xl text-[#555]">:</span>

            <div class="flex flex-col items-center">
              <span
                class="flex h-14 w-14 items-center justify-center border border-[#1E1E1E] text-2xl font-light text-[#C8A97E] md:h-16 md:w-16 md:text-3xl"
              >
                {{ timeLeft.hours.toString().padStart(2, '0') }}
              </span>
              <span
                class="mt-2 text-[10px] tracking-widest text-[#555] uppercase"
              >
                Heures
              </span>
            </div>

            <span class="mb-7 text-xl text-[#555]">:</span>

            <div class="flex flex-col items-center">
              <span
                class="flex h-14 w-14 items-center justify-center border border-[#1E1E1E] text-2xl font-light text-[#C8A97E] md:h-16 md:w-16 md:text-3xl"
              >
                {{ timeLeft.minutes.toString().padStart(2, '0') }}
              </span>
              <span
                class="mt-2 text-[10px] tracking-widest text-[#555] uppercase"
              >
                Min
              </span>
            </div>

            <span class="mb-7 text-xl text-[#555]">:</span>

            <div class="flex flex-col items-center">
              <span
                class="flex h-14 w-14 items-center justify-center border border-[#1E1E1E] text-2xl font-light text-[#C8A97E] md:h-16 md:w-16 md:text-3xl"
              >
                {{ timeLeft.seconds.toString().padStart(2, '0') }}
              </span>
              <span
                class="mt-2 text-[10px] tracking-widest text-[#555] uppercase"
              >
                Sec
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="hasDiscount"
          class="mb-6 h-px w-full bg-[#1E1E1E]"
        />

        <div
          v-for="attribute in availableAttributes"
          :key="attribute.id"
          class="mb-4"
        >
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
              {{ attribute.name }}
            </h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in attribute.options"
              :key="option.id"
              type="button"
              @click="selectOption(attribute.id, option.id)"
              class="border px-4 py-2 text-xs tracking-widest uppercase transition-all"
              :class="
                selectedOptions[attribute.id] === option.id
                  ? 'bg-surface border-[#C8A97E] text-[#C8A97E]'
                  : 'border-[#1E1E1E] text-[#555] hover:border-[#C8A97E]/40 hover:text-[#E8E8E8]'
              "
            >
              {{ option.name }}
            </button>
          </div>
        </div>

        <div class="mb-6 flex gap-4 pt-4">
          <div
            class="bg-surface flex w-36 items-center border border-[#1E1E1E]"
          >
            <button
              type="button"
              @click="decrementQuantity"
              class="w-12 p-3 text-[#555] transition-colors hover:text-[#C8A97E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="
                quantity <= 1 || isOutOfStock || hasIncompleteSelection
              "
            >
              <Minus class="h-4 w-4" />
            </button>
            <span class="flex-1 px-2 text-center text-sm text-[#E8E8E8]">
              {{ quantity }}
            </span>
            <button
              type="button"
              @click="incrementQuantity"
              class="w-12 p-3 text-[#555] transition-colors hover:text-[#C8A97E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="
                quantity >= maxQuantity ||
                isOutOfStock ||
                hasIncompleteSelection
              "
            >
              <Plus class="h-4 w-4" />
            </button>
          </div>

          <LoadingButton
            @click="handleaddCartItem"
            :loading="
              isAddingCartItem || isOutOfStock || hasIncompleteSelection
            "
            :disabled="
              isAddingCartItem || isOutOfStock || hasIncompleteSelection
            "
            class="flex h-11 flex-1 items-center justify-center border text-xs tracking-[0.2em] uppercase transition-all disabled:opacity-50"
            :class="
              isOutOfStock || hasIncompleteSelection
                ? 'border-[#1E1E1E] text-[#555]'
                : 'border-[#C8A97E] bg-[#C8A97E] text-[#0A0A0A] hover:bg-[#B8995E]'
            "
          >
            {{
              isOutOfStock
                ? 'Rupture de stock'
                : hasIncompleteSelection
                  ? 'Sélectionner options'
                  : 'Ajouter au panier'
            }}
          </LoadingButton>
        </div>

        <div class="mb-6 h-px w-full bg-[#1E1E1E]" />

        <div class="space-y-2 text-sm text-[#555]">
          <div class="flex justify-between">
            <span class="text-xs tracking-widest uppercase">Catégorie :</span>

            <RouterLink
              :to="`/shop?categories=${product.category?.slug}`"
              class="text-[#C8A97E] transition-colors hover:text-[#E8E8E8]"
            >
              {{ product.category?.name || 'N/A' }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
