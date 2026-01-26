<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import ProductModal from '@/components/views/product/ProductModal.vue'
import { useWishlists } from '@/composables/useWishlists'
import type { ProductWithDetails } from '@/types'
import { formatPrice } from '@/utils/lib'
import { HeartIcon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import ProductRating from './ProductRating.vue'

interface Props {
  product: ProductWithDetails
}

const props = defineProps<Props>()

const isModalOpen = ref(false)

const handleaddCartItemClick = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  isModalOpen.value = true
}

const {
  wishlistItems,
  addWishlistItem,
  isAddingToWishlist,
  removeWishlistItem,
  isRemovingWishlistItem,
} = useWishlists()

const discount = computed(() => {
  if (!props.product.price || !props.product.basePrice) return 0
  if (props.product.price >= props.product.basePrice) return 0

  // Check if the discount has expired
  if (props.product.expiresAt) {
    const expiresAt = new Date(props.product.expiresAt)
    if (expiresAt <= new Date()) return 0 // Expired
  }

  return Math.round(
    ((props.product.basePrice - props.product.price) /
      props.product.basePrice) *
      100,
  )
})

const hasDiscount = computed(() => discount.value > 0)

const isNew = computed(() => {
  const now = new Date()
  const createdAt = new Date(props.product.createdAt)
  return now.getTime() - createdAt.getTime() < 30 * 24 * 60 * 60 * 1000
})

const lowestPrice = computed(() => {
  if (!props.product.productVariants) return 0

  return Math.min(
    ...props.product.productVariants.map((v) => v.price ?? v.basePrice),
  )
})

const isInWishlist = computed(() => {
  return wishlistItems.value.some(
    (item) => item.product.id === props.product.id,
  )
})

const hasVariants = computed(() => {
  return (
    props.product.productVariants && props.product.productVariants.length > 0
  )
})

const handleToggleWishlist = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()

  if (!props.product?.id) {
    toast.error('Please select a product')
    return
  }

  if (isAddingToWishlist.value || isRemovingWishlistItem.value) {
    return
  }

  // Ne jamais passer variantId pour les produits avec variantes
  const variantId = hasVariants.value ? undefined : undefined

  if (isInWishlist.value) {
    await removeWishlistItem(props.product.id, variantId)
  } else {
    await addWishlistItem(props.product.id, variantId)
  }
}
</script>

<template>
  <!-- Actual Product Card -->
  <RouterLink
    :to="`/products/${product.slug}`"
    class="group h-full w-full shrink-0 sm:max-w-70"
  >
    <div
      class="relative flex h-full flex-col gap-2 transition-transform duration-200"
    >
      <!-- Image Container -->
      <div class="relative h-80 w-full shrink-0 overflow-hidden">
        <!-- Image 2 (bottom layer - always visible) -->
        <img
          v-if="product.images[1]"
          :src="product.images[1]"
          :alt="product.name"
          class="absolute inset-0 h-full w-full object-cover"
        />

        <!-- Image 1 (top layer - disappears on hover) -->
        <img
          :src="product.images[0]"
          :alt="product.name"
          class="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        />

        <!-- "Add to cart" overlay -->
        <div
          class="absolute inset-x-2 bottom-2 z-20 transition-all duration-200 group-hover:translate-y-0 sm:translate-y-2 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <button
            @click="handleaddCartItemClick"
            class="w-full cursor-pointer rounded-md bg-black/95 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-black"
          >
            Add to cart
          </button>
        </div>

        <!-- Badges -->
        <div
          class="absolute top-2 left-2 z-20 flex flex-col items-stretch gap-1.5"
        >
          <div
            v-if="isNew"
            class="rounded bg-white/95 px-1.5 py-0.5 text-xs font-semibold text-black shadow-sm"
          >
            New
          </div>
          <div
            v-if="hasDiscount"
            class="rounded bg-green-500 px-1.5 py-0.5 text-xs font-semibold text-white shadow-sm"
          >
            -{{ discount }}%
          </div>
        </div>

        <!-- Actions -->
        <div
          class="absolute top-2 right-2 z-20 flex flex-col gap-1.5 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <LoadingButton
            severity="secondary"
            :loading="isAddingToWishlist || isRemovingWishlistItem"
            @click="handleToggleWishlist"
            :disabled="isAddingToWishlist || isRemovingWishlistItem"
            class="rounded-full bg-white p-1.5 text-black shadow hover:bg-white"
            size="sm"
            type="button"
          >
            <HeartIcon
              class="size-5"
              :class="isInWishlist && 'fill-black'"
            />
          </LoadingButton>
        </div>
      </div>

      <!-- Product Info -->
      <div class="flex flex-col gap-1.5 px-1">
        <ProductRating :rating="product.averageRating" />

        <h3 class="line-clamp-2 text-base leading-snug font-medium sm:text-lg">
          {{ product.name }}
        </h3>

        <!-- Price -->
        <div class="flex items-center gap-2">
          <template v-if="product.price || product.basePrice">
            <!-- Current price (or basePrice if no discount price) -->
            <p class="text-base font-semibold">
              {{ formatPrice(product.price ?? product.basePrice ?? 0) }}
            </p>
            <!-- Base price (crossed out) - only show if there's an active discount -->
            <p
              v-if="hasDiscount && product.basePrice"
              class="text-muted-foreground text-sm line-through"
            >
              {{ formatPrice(product.basePrice) }}
            </p>
          </template>
          <p
            v-else
            class="text-base font-semibold"
          >
            <span class="font-normal text-gray-500">From</span>
            {{ formatPrice(lowestPrice) }}
          </p>
        </div>
      </div>
    </div>
  </RouterLink>

  <!-- Quick View Modal -->
  <ProductModal
    :slug="product.slug"
    v-model:open="isModalOpen"
  />
</template>

<style scoped></style>
