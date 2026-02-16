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

  if (props.product.expiresAt) {
    const expiresAt = new Date(props.product.expiresAt)
    if (expiresAt <= new Date()) return 0
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
    toast.error('Veuillez sélectionner un produit')
    return
  }

  if (isAddingToWishlist.value || isRemovingWishlistItem.value) {
    return
  }

  const variantId = hasVariants.value ? undefined : undefined

  if (isInWishlist.value) {
    await removeWishlistItem(props.product.id, variantId)
  } else {
    await addWishlistItem(props.product.id, variantId)
  }
}
</script>

<template>
  <RouterLink
    :to="`/products/${product.slug}`"
    class="group h-full w-full shrink-0 sm:max-w-70"
  >
    <div
      class="relative flex h-full flex-col gap-3 transition-transform duration-200"
    >
      <div
        class="bg-surface relative h-80 w-full shrink-0 overflow-hidden border border-[#1E1E1E]"
      >
        <img
          v-if="product.images[1]"
          :src="product.images[1]"
          :alt="product.name"
          class="absolute inset-0 h-full w-full object-cover opacity-100"
        />

        <img
          :src="product.images[0]"
          :alt="product.name"
          class="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-300 group-hover:opacity-0"
        />

        <div
          class="absolute inset-x-3 bottom-3 z-20 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <button
            @click="handleaddCartItemClick"
            class="w-full border border-[#C8A97E]/40 bg-[#0A0A0A]/90 px-4 py-3 text-center text-xs tracking-widest text-[#C8A97E] uppercase backdrop-blur-sm transition-all hover:border-[#C8A97E] hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
          >
            Ajouter au panier
          </button>
        </div>

        <div
          class="absolute top-3 left-3 z-20 flex flex-col items-stretch gap-1.5"
        >
          <div
            v-if="isNew"
            class="border border-[#C8A97E]/40 bg-[#0A0A0A]/90 px-2 py-1 text-[10px] tracking-widest text-[#C8A97E] uppercase backdrop-blur-sm"
          >
            Nouveau
          </div>
          <div
            v-if="hasDiscount"
            class="bg-[#C8A97E] px-2 py-1 text-[10px] tracking-widest text-[#0A0A0A] uppercase"
          >
            -{{ discount }}%
          </div>
        </div>

        <div
          class="absolute top-3 right-3 z-20 translate-x-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        >
          <button
            @click="handleToggleWishlist"
            :disabled="isAddingToWishlist || isRemovingWishlistItem"
            class="border border-[#1E1E1E] bg-[#0A0A0A]/90 p-2 backdrop-blur-sm transition-all hover:border-[#C8A97E]/40 disabled:opacity-50"
          >
            <LoadingButton
              v-if="isAddingToWishlist || isRemovingWishlistItem"
              :loading="true"
              class="p-0"
            />
            <HeartIcon
              v-else
              class="size-5 text-[#555] transition-colors group-hover:text-[#C8A97E]"
              :class="isInWishlist && 'fill-[#C8A97E] text-[#C8A97E]'"
            />
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-1.5 px-1">
        <ProductRating :rating="product.averageRating" />

        <h3 class="line-clamp-2 text-sm font-light text-[#E8E8E8] sm:text-base">
          {{ product.name }}
        </h3>

        <div class="flex items-center gap-2">
          <template v-if="product.price || product.basePrice">
            <p class="text-sm font-light text-[#C8A97E]">
              {{ formatPrice(product.price ?? product.basePrice ?? 0) }}
            </p>
            <p
              v-if="hasDiscount && product.basePrice"
              class="text-xs text-[#555] line-through"
            >
              {{ formatPrice(product.basePrice) }}
            </p>
          </template>
          <p
            v-else
            class="text-sm text-[#C8A97E]"
          >
            <span class="text-xs text-[#555]">À partir de</span>
            {{ formatPrice(lowestPrice) }}
          </p>
        </div>
      </div>
    </div>
  </RouterLink>

  <ProductModal
    :slug="product.slug"
    v-model:open="isModalOpen"
  />
</template>
