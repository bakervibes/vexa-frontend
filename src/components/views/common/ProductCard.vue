<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import ProductModal from '@/components/views/product/ProductModal.vue'
import { useWishlists, useWishlistsMutation } from '@/composables/useWishlists'
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

const handleAddToCartClick = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
  isModalOpen.value = true
}

const { items } = useWishlists()
const {
  addToWishlist,
  isAddingWishlistItem,
  removeWishlistItem,
  isRemovingWishlistItem,
} = useWishlistsMutation()

const discount = computed(() => {
  if (!props.product.price || !props.product.basePrice) return 0

  return Math.round(
    ((props.product.basePrice - props.product.price) /
      props.product.basePrice) *
      100,
  )
})

const isNew = computed(() => {
  const now = new Date()
  const createdAt = new Date(props.product.createdAt)
  return now.getTime() - createdAt.getTime() < 30 * 24 * 60 * 60 * 1000
})

const lowestPrice = computed(() => {
  if (!props.product.variants) return 0

  return Math.min(...props.product.variants.map((v) => v.price ?? v.basePrice))
})

const isInWishlist = computed(() => {
  return items.value.some((item) => item.product.id === props.product.id)
})

const hasVariants = computed(() => {
  return props.product.variants && props.product.variants.length > 0
})

const handleToggleWishlist = async (e: Event) => {
  e.preventDefault()
  e.stopPropagation()

  if (!props.product?.id) {
    toast.error('Please select a product')
    return
  }

  if (isAddingWishlistItem.value || isRemovingWishlistItem.value) {
    return
  }

  // Ne jamais passer variantId pour les produits avec variantes
  const variantId = hasVariants.value ? undefined : undefined

  if (isInWishlist.value) {
    await removeWishlistItem(props.product.id, variantId, props.product.slug)
  } else {
    await addToWishlist(props.product.id, variantId, props.product.slug)
  }
}
</script>

<template>
  <!-- Actual Product Card -->
  <RouterLink
    :to="`/products/${product.slug}`"
    class="group h-full w-full shrink-0"
  >
    <div
      class="relative flex h-full flex-col gap-2 transition-transform duration-200"
    >
      <!-- Image Container -->
      <div class="relative h-80 w-full shrink-0 overflow-hidden sm:h-80">
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
            @click="handleAddToCartClick"
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
            v-if="discount !== 0"
            class="rounded px-1.5 py-0.5 text-xs font-semibold text-white shadow-sm"
            :class="discount > 0 ? 'bg-green-500' : 'bg-red-500'"
          >
            {{ discount > 0 ? `-${discount}%` : `+${-discount}%` }}
          </div>
        </div>

        <!-- Actions -->
        <div
          class="absolute top-2 right-2 z-20 flex flex-col gap-1.5 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <LoadingButton
            :loading="isAddingWishlistItem || isRemovingWishlistItem"
            @click="handleToggleWishlist"
            :disabled="isAddingWishlistItem || isRemovingWishlistItem"
            class="rounded-full bg-white/95 p-1.5 text-black shadow-md transition-all duration-200 hover:bg-white"
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
            <p
              v-if="product.price"
              class="text-base font-bold"
            >
              {{ formatPrice(product.price) }}
            </p>
            <p
              v-if="product.basePrice"
              class="text-sm"
              :class="{
                'text-muted-foreground line-through': product.price,
              }"
            >
              {{ formatPrice(product.basePrice) }}
            </p>
          </template>
          <p
            v-else
            class="text-muted-foreground text-sm"
          >
            From {{ formatPrice(lowestPrice) }}
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
