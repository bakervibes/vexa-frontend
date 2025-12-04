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
import { useCartsMutation } from '@/composables/useCarts'
import { useProduct } from '@/composables/useProducts'
import { useProductReviews } from '@/composables/useReviews'
import { useWishlists, useWishlistsMutation } from '@/composables/useWishlists'
import type { ProductVariantWithDetails } from '@/types/products'
import { formatPrice } from '@/utils/lib'
import { Heart, Minus, Plus } from 'lucide-vue-next'
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

const { slug, isModal = false } = props
const { product, isLoadingProduct, isErrorProduct } = useProduct(slug)
const { addToCart, isAddingCartItem } = useCartsMutation()

// Paginated reviews
const productId = computed(() => product.value?.id)
const {
  reviews: paginatedReviews,
  fetchReviews,
  refresh: refreshReviews,
} = useProductReviews(productId)
const {
  addToWishlist,
  isAddingWishlistItem,
  removeWishlistItem,
  isRemovingWishlistItem,
} = useWishlistsMutation()
const { items } = useWishlists()

const isInWishlist = computed(() => {
  return items.value.some((item) => item.product.id === product.value?.id)
})

const selectedImageIndex = ref(0)
const quantity = ref(1)

// Map of Attribute ID -> Option ID (empty by default, no pre-selection)
const selectedOptions = ref<Record<string, string>>({})

// Computed property to group available attributes and options from variants
const availableAttributes = computed(() => {
  if (!product.value?.variants) return []

  const attributesMap = new Map<
    string,
    {
      id: string
      name: string
      slug: string
      options: Map<string, { id: string; name: string; value: string }>
    }
  >()

  product.value.variants.forEach((variant) => {
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

// Determine if product has variants
const hasVariants = computed(() => {
  return availableAttributes.value.length > 0
})

// Find the variant that matches the selected options
const currentVariant = computed<ProductVariantWithDetails | undefined>(() => {
  if (!product.value?.variants || !hasVariants.value) return undefined

  // Must have all attributes selected
  if (
    Object.keys(selectedOptions.value).length !==
    availableAttributes.value.length
  ) {
    return undefined
  }

  return product.value.variants.find((variant) => {
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

// Check if all options are selected but no matching variant
const hasIncompleteSelection = computed(() => {
  return hasVariants.value && !currentVariant.value
})

const canShowPriceAndStock = computed(() => {
  if (!hasVariants.value) return true // Simple product
  return currentVariant.value !== undefined // Valid variant selected
})

const currentPrice = computed(() => {
  if (hasVariants.value && currentVariant.value) {
    return currentVariant.value.price ?? currentVariant.value.basePrice
  }
  // Simple product
  return product.value?.price ?? product.value?.basePrice ?? 0
})

const currentBasePrice = computed(() => {
  if (hasVariants.value && currentVariant.value) {
    return currentVariant.value.basePrice
  }
  // Simple product
  return product.value?.basePrice ?? 0
})

const currentStock = computed(() => {
  if (hasVariants.value && currentVariant.value) {
    return currentVariant.value.stock ?? 0
  }
  // Simple product
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

  const hasPrice = !!currentPrice.value
  if (!hasPrice) return false

  // Check if the offer has not expired
  const expirationDate =
    currentVariant.value?.expiresAt || product.value?.expiresAt
  if (!expirationDate) return true // No expiration = always active

  const expiresAt = new Date(expirationDate).getTime()
  const now = new Date().getTime()

  return expiresAt > now
})

const currentImage = computed(() => {
  if (!product.value?.images || product.value.images.length === 0)
    return '/placeholder.png'
  return product.value.images[selectedImageIndex.value]
})

// Track if options have been initialized for current product
const optionsInitialized = ref(false)
const lastInitializedProductId = ref<string | null>(null)

// Watch for slug changes to reset state
watch(
  () => slug,
  (newSlug, oldSlug) => {
    if (newSlug !== oldSlug) {
      // Reset state for new product
      selectedImageIndex.value = 0
      quantity.value = 1
      selectedOptions.value = {}
      optionsInitialized.value = false
      lastInitializedProductId.value = null
    }
  },
  { immediate: false },
)

// Initialize selected options from URL (no defaults, user must choose)
// In modal mode, we don't read from URL
const initSelectedOptions = () => {
  if (!product.value || !hasVariants.value) return

  // Prevent re-initialization if options are already set for this product
  // This prevents options from being reset on refetch (e.g., after adding to cart)
  if (
    optionsInitialized.value &&
    lastInitializedProductId.value === product.value.id
  ) {
    return
  }

  // In modal mode, start with empty selection
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

// Update URL when selection changes (only in non-modal mode)
const updateUrl = () => {
  // Skip URL updates in modal mode
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
      // Remove from query if not selected
      delete query[attr.name]
    }
  })

  router.replace({ query, params: route.params })
}

const selectOption = (attributeId: string, optionId: string) => {
  // Toggle: if already selected, deselect it
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
  () => product.value,
  () => {
    initSelectedOptions()
  },
  { immediate: true },
)

// Reset quantity when variant changes or stock changes
watch([currentVariant, currentStock], () => {
  // Reset to 1 if new stock is insufficient
  if (quantity.value > maxQuantity.value) {
    quantity.value = 1
  }

  // Also reset timer if variant changed (new expiration possible)
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

const handleAddToCart = async () => {
  // Check stock
  if (isOutOfStock.value) {
    toast.error('This product is out of stock')
    return
  }

  // For variant products, must have a valid variant selected
  if (hasVariants.value && !currentVariant.value) {
    toast.error('Please select all options')
    return
  }

  if (!product.value?.id) {
    toast.error('Error adding to cart')
    return
  }

  await addToCart(
    product.value.id,
    quantity.value,
    currentVariant.value?.id,
    product.value.slug,
  )
  quantity.value = 1
}

const handleToggleWishlist = async () => {
  if (!product.value?.id) {
    toast.error('Please select a product')
    return
  }

  if (isAddingWishlistItem.value || isRemovingWishlistItem.value) {
    return
  }

  if (isInWishlist.value) {
    await removeWishlistItem(
      product.value.id,
      currentVariant.value?.id,
      product.value.slug,
    )
  } else {
    await addToWishlist(
      product.value.id,
      currentVariant.value?.id,
      product.value.slug,
    )
  }
}

// TimeLeft timer logic
const timeLeft = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
})

// Fetch reviews when product loads
watch(
  () => product.value?.id,
  (newId) => {
    if (newId) {
      fetchReviews(1)
    }
  },
  { immediate: true },
)

let intervalId: number | null = null

const calculateTimeLeft = () => {
  // Priority to variant expiration if it exists
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

onMounted(() => {
  calculateTimeLeft()
  intervalId = window.setInterval(calculateTimeLeft, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

const showReviewForm = ref(false)
</script>

<template>
  <div
    v-if="isLoadingProduct"
    class="flex justify-center py-20"
  >
    <div
      class="h-12 w-12 animate-spin rounded-full border-b-2 border-black"
    ></div>
  </div>

  <div
    v-else-if="isErrorProduct"
    class="py-20 text-center text-red-500"
  >
    Failed to load product. Please try again.
  </div>

  <!-- Details Section -->
  <div
    v-else-if="product"
    :class="isModal ? 'px-2 py-4' : 'container mx-auto px-4 py-8'"
  >
    <!-- Breadcrumbs (hidden in modal mode) -->
    <nav
      v-if="!isModal"
      class="mb-8 flex items-center text-sm text-gray-500"
    >
      <CustomBreadcrumb
        :items="[
          { label: 'Home', link: '/' },
          { label: 'Shop', link: '/shop' },
          {
            label: product?.category?.name ?? 'Category',
            link: `/shop?categories=${product?.category?.slug}`,
          },
          { label: product?.name ?? 'Product', link: `/shop/${product?.slug}` },
        ]"
      />
    </nav>

    <div
      :class="[
        'flex flex-col gap-12',
        isModal
          ? 'items-stretch lg:flex-col'
          : 'items-stretch lg:flex-row lg:items-start',
      ]"
    >
      <!-- Left Column: Images -->
      <div
        :class="[
          'flex w-full flex-col gap-2',
          !isModal && 'lg:h-full lg:w-1/2',
        ]"
      >
        <!-- Carousel for Modal and Mobile -->
        <div :class="[isModal ? 'block' : 'block lg:hidden']">
          <Carousel
            :opts="{
              align: 'start',
              slidesToScroll: 1,
              watchDrag: false,
            }"
          >
            <CarouselPrevious />

            <CarouselContent>
              <CarouselItem
                v-for="(img, index) in product.images"
                :key="index"
                class="sm:basis-1/2 lg:basis-1/3"
              >
                <div
                  class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-[#F3F5F7]"
                >
                  <!-- Badges -->
                  <div
                    class="absolute top-3 left-3 z-10 flex flex-col items-stretch gap-2"
                  >
                    <span
                      class="rounded bg-white px-1.5 py-0.5 text-xs font-bold tracking-wider uppercase shadow-sm"
                    >
                      NEW
                    </span>
                    <span
                      v-if="discount !== 0"
                      class="rounded px-1.5 py-0.5 text-xs font-bold text-white shadow-sm"
                      :class="discount > 0 ? 'bg-green-500' : 'bg-red-500'"
                    >
                      {{ discount > 0 ? `-${discount}%` : `+${-discount}%` }}
                    </span>
                  </div>

                  <div
                    v-if="index === 0"
                    class="absolute top-3 right-3 z-10"
                  >
                    <LoadingButton
                      :loading="isAddingWishlistItem || isRemovingWishlistItem"
                      @click="handleToggleWishlist"
                      class="h-11 w-11 rounded-md"
                      :disabled="isAddingWishlistItem || isRemovingWishlistItem"
                      variant="outline"
                    >
                      <Heart :class="isInWishlist && 'fill-black'" />
                    </LoadingButton>
                  </div>

                  <img
                    :src="img"
                    :alt="`${product.name} view ${index + 1}`"
                    class="h-full w-full object-cover"
                  />
                </div>
              </CarouselItem>
            </CarouselContent>

            <CarouselNext />
          </Carousel>
        </div>

        <!-- Desktop Layout (non-modal) -->
        <div
          v-if="!isModal"
          class="hidden lg:flex lg:h-full lg:flex-col lg:gap-2"
        >
          <div
            class="relative flex aspect-square w-full flex-1 items-center justify-center overflow-hidden rounded-md bg-[#F3F5F7]"
          >
            <!-- Badges -->
            <div class="absolute top-3 left-3 z-10 flex flex-col gap-2">
              <span
                class="rounded bg-white px-1.5 py-0.5 text-xs font-bold tracking-wider uppercase shadow-sm"
              >
                NEW
              </span>
              <span
                v-if="discount !== 0"
                class="rounded px-1.5 py-0.5 text-xs font-bold text-white shadow-sm"
                :class="discount > 0 ? 'bg-green-500' : 'bg-red-500'"
              >
                {{ discount > 0 ? `-${discount}%` : `+${-discount}%` }}
              </span>
            </div>

            <div class="absolute top-3 right-3 z-10">
              <LoadingButton
                :loading="isAddingWishlistItem || isRemovingWishlistItem"
                @click="handleToggleWishlist"
                class="h-11 w-11 rounded-md"
                :disabled="isAddingWishlistItem || isRemovingWishlistItem"
                variant="outline"
              >
                <Heart :class="isInWishlist && 'fill-black'" />
              </LoadingButton>
            </div>

            <!-- Main Image -->
            <img
              :src="currentImage"
              :alt="product.name"
              class="h-full w-full object-cover"
            />
          </div>

          <!-- Thumbnails -->
          <div
            class="grid grid-cols-4 gap-3 p-1 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5"
          >
            <button
              v-for="(img, index) in product.images"
              :key="index"
              @click="selectedImageIndex = index"
              class="relative aspect-square w-full shrink-0 cursor-pointer overflow-hidden rounded-md"
              :class="
                selectedImageIndex === index && 'border-2 border-black/80'
              "
            >
              <img
                :src="img"
                :alt="`${product.name} view ${index + 1}`"
                class="h-full w-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Details -->
      <div
        :class="['flex w-full flex-col space-y-6 pb-2', !isModal && 'lg:w-1/2']"
      >
        <div class="flex flex-col space-y-4">
          <!-- Rating -->
          <div class="flex items-center gap-2">
            <ProductRating :rating="product.averageRating || 0" />
            <span class="text-xs text-gray-500">
              {{ product.reviewCount }} Reviews
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-4xl text-black">{{ product.name }}</h1>

          <div
            v-if="canShowPriceAndStock"
            class="flex flex-col gap-4"
          >
            <div class="flex items-center gap-4">
              <span class="text-2xl font-medium text-black">
                {{ formatPrice(currentPrice) }}
              </span>
              <span
                v-if="hasDiscount"
                class="text-muted-foreground text-xl line-through"
              >
                {{ formatPrice(currentBasePrice) }}
              </span>
            </div>

            <!-- Stock Status -->
            <div
              v-if="isOutOfStock"
              class="text-sm font-medium text-red-600"
            >
              Out of stock
            </div>
            <div
              v-else-if="currentStock < 10"
              class="text-sm font-medium text-orange-600"
            >
              Only {{ currentStock }} left in stock
            </div>
            <div
              v-else
              class="text-sm font-medium text-green-600"
            >
              In stock ({{ currentStock }} available)
            </div>
          </div>

          <!-- Message for incomplete selection -->
          <div
            v-if="hasIncompleteSelection"
            class="rounded-lg bg-amber-50 p-3 text-sm text-amber-600"
          >
            Please select all options to continue.
          </div>

          <!-- Description -->
          <div className="space-y-2">
            <h3 className="font-semibold text-xl leading-6">Description</h3>
            <p className="leading-relaxed text-gray-700">
              {{ product.description }}
            </p>
          </div>
        </div>

        <div
          v-if="hasDiscount"
          class="w-full border-b border-gray-200"
        />

        <!-- TimeLeft -->
        <div v-if="hasDiscount">
          <p class="mb-3 text-sm text-gray-500">Offer expires in:</p>
          <div class="flex items-center gap-2">
            <div class="flex flex-col items-center">
              <span
                class="flex h-12 min-w-16 items-center justify-center bg-[#F3F5F7] px-3 text-3xl font-medium"
              >
                {{ timeLeft.days.toString().padStart(2, '0') }}
              </span>
              <span class="mt-1 text-xs text-gray-500">Days</span>
            </div>
            <span class="flex items-center text-3xl text-gray-500">:</span>
            <div class="flex flex-col items-center">
              <span
                class="flex h-12 min-w-16 items-center justify-center bg-[#F3F5F7] px-3 text-3xl font-medium"
              >
                {{ timeLeft.hours.toString().padStart(2, '0') }}
              </span>
              <span class="mt-1 text-xs text-gray-500">Hours</span>
            </div>
            <span class="flex items-center text-3xl text-gray-500">:</span>
            <div class="flex flex-col items-center">
              <span
                class="flex h-12 min-w-16 items-center justify-center bg-[#F3F5F7] px-3 text-3xl font-medium"
              >
                {{ timeLeft.minutes.toString().padStart(2, '0') }}
              </span>
              <span class="mt-1 text-xs text-gray-500">Minutes</span>
            </div>
            <span class="flex items-center text-3xl text-gray-500">:</span>
            <div class="flex flex-col items-center">
              <span
                class="flex h-12 min-w-16 items-center justify-center bg-[#F3F5F7] px-3 text-3xl font-medium"
              >
                {{ timeLeft.seconds.toString().padStart(2, '0') }}
              </span>
              <span class="mt-1 text-xs text-gray-500">Seconds</span>
            </div>
          </div>
        </div>

        <div class="w-full border-b border-gray-200" />

        <!-- Attributes Selection -->
        <div
          v-for="attribute in availableAttributes"
          :key="attribute.id"
          class="mb-4"
        >
          <div class="mb-2 flex max-w-[200px] items-center justify-between">
            <h3 class="font-medium text-gray-900">
              {{ attribute.name }}
            </h3>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="option in attribute.options"
              :key="option.id"
              @click="selectOption(attribute.id, option.id)"
              class="flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm transition-all"
              :class="
                selectedOptions[attribute.id] === option.id
                  ? 'border-black/40 bg-blue-100'
                  : 'hover:border-gray-200'
              "
            >
              {{ option.name }}
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div class="mb-8 flex gap-4">
          <!-- Quantity -->
          <div class="flex items-center rounded-md bg-[#F3F5F7]">
            <button
              @click="decrementQuantity"
              class="cursor-pointer p-4 text-black disabled:cursor-not-allowed disabled:text-black/40"
              :disabled="
                quantity <= 1 || isOutOfStock || hasIncompleteSelection
              "
            >
              <Minus class="h-4 w-4" />
            </button>
            <span class="w-4 text-center font-medium">{{ quantity }}</span>
            <button
              @click="incrementQuantity"
              class="cursor-pointer p-4 text-black disabled:cursor-not-allowed disabled:text-black/40"
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
            :loading="isAddingCartItem"
            @click="handleAddToCart"
            class="h-12 w-full flex-1 rounded-md text-lg disabled:cursor-not-allowed"
            :disabled="
              isAddingCartItem || isOutOfStock || hasIncompleteSelection
            "
          >
            <span v-if="isOutOfStock">Out of stock</span>
            <span v-else-if="hasIncompleteSelection">
              Please select options
            </span>
            <span v-else>Add to cart</span>
          </LoadingButton>
        </div>

        <!-- Meta Info -->
        <div
          class="flex flex-col gap-2 text-xs tracking-wider text-gray-500 uppercase"
        >
          <div class="flex gap-8">
            <span class="w-20">SKU</span>
            <span class="text-black normal-case">
              {{ currentVariant?.sku || product.sku }}
            </span>
          </div>
          <div class="flex gap-8">
            <span class="w-20">Category</span>
            <span class="text-black normal-case">
              {{ product.category.name }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
