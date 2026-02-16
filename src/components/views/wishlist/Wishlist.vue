<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCarts } from '@/composables/useCarts'
import { useSharedWishlists } from '@/composables/useSharedWishlists'
import { useWishlists } from '@/composables/useWishlists'
import type { WishlistItemWithDetails } from '@/types'
import { formatPrice, formatRelativeTime } from '@/utils/lib'
import {
  ArrowLeftIcon,
  CheckIcon,
  HeartIcon,
  ImportIcon,
  Share2Icon,
  Trash2Icon,
  XIcon,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const { cartItems, addCartItem } = useCarts()

const {
  wishlistItems,
  wishlistUpdatedAt,
  isLoadingWishlist,
  isClearingWishlist,
  removeWishlistItem,
  isRemovingWishlistItem,
  clearWishlist,
  addWishlistItem,
} = useWishlists()

const {
  shareToken,
  isLoadingShared,
  shareWishlist,
  importSharedWishlist,
  isImportingSharedWishlist,
  sharedWishlistItems,
  sharedWishlistUpdatedAt,
  isLoadingShareToken,
} = useSharedWishlists()

const items = computed(() =>
  !!shareToken.value ? sharedWishlistItems.value : wishlistItems.value,
)

const isLoading = computed(() =>
  !!shareToken.value ? isLoadingShared.value : isLoadingWishlist.value,
)

const lastModified = computed(() =>
  !!shareToken.value ? sharedWishlistUpdatedAt.value : wishlistUpdatedAt.value,
)

const cartActionItemId = ref<string | null>(null)
const removeActionItemId = ref<string | null>(null)
const wishlistActionItemId = ref<string | null>(null)

const isGlobalActionInProgress = computed(
  () =>
    isLoadingShareToken.value ||
    isClearingWishlist.value ||
    isImportingSharedWishlist.value,
)

const isItemActionInProgress = computed(
  () =>
    cartActionItemId.value !== null ||
    removeActionItemId.value !== null ||
    wishlistActionItemId.value !== null,
)

const isAnyActionInProgress = computed(
  () => isGlobalActionInProgress.value || isItemActionInProgress.value,
)

const getItemKey = (productId: string, variantId?: string | null) => {
  return variantId ? `${productId}-${variantId}` : productId
}

const getItemPrice = (item: WishlistItemWithDetails) => {
  return (
    item.productVariant?.price ??
    item.productVariant?.basePrice ??
    item.product?.price ??
    item.product?.basePrice ??
    Math.min(...item.product.productVariants.map((v) => v.price ?? v.basePrice))
  )
}

const needsVariantSelection = (item: WishlistItemWithDetails) => {
  return !item.product.basePrice && !item.productVariant
}

const isInCart = (productId: string, variantId?: string | null) => {
  return cartItems.value.some(
    (cartItem) =>
      cartItem.product.id === productId &&
      (cartItem.productVariant?.id ?? null) === (variantId ?? null),
  )
}

const isInMyWishlist = (productId: string, variantId?: string | null) => {
  return wishlistItems.value.some(
    (item) =>
      item.productId === productId &&
      (item.productVariantId ?? null) === (variantId ?? null),
  )
}

const isCartActioning = (productId: string, variantId?: string | null) => {
  return cartActionItemId.value === getItemKey(productId, variantId)
}

const isRemoveActioning = (productId: string, variantId?: string | null) => {
  return removeActionItemId.value === getItemKey(productId, variantId)
}

const isWishlistActioning = (productId: string, variantId?: string | null) => {
  return wishlistActionItemId.value === getItemKey(productId, variantId)
}

const handleAddCartItem = async (item: WishlistItemWithDetails) => {
  if (isAnyActionInProgress.value) return

  const key = getItemKey(item.product.id, item.productVariant?.id)
  cartActionItemId.value = key
  try {
    await addCartItem(item.product.id, 1, item.productVariant?.id)
  } catch {
  } finally {
    cartActionItemId.value = null
  }
}

const handleRemoveItem = async (item: WishlistItemWithDetails) => {
  if (isAnyActionInProgress.value) return

  const key = getItemKey(item.product.id, item.productVariant?.id)
  removeActionItemId.value = key
  try {
    await removeWishlistItem(item.product.id, item.productVariant?.id)
  } catch {
  } finally {
    removeActionItemId.value = null
  }
}

const handleToggleMyWishlist = async (
  productId: string,
  variantId?: string | null,
) => {
  if (isAnyActionInProgress.value) return

  const key = getItemKey(productId, variantId)
  wishlistActionItemId.value = key
  try {
    if (isInMyWishlist(productId, variantId)) {
      await removeWishlistItem(productId, variantId ?? undefined)
    } else {
      await addWishlistItem(productId, variantId ?? undefined)
    }
  } catch {
  } finally {
    wishlistActionItemId.value = null
  }
}
</script>

<template>
  <div class="bg-noir flex flex-col gap-8">
    <div
      v-if="isLoading"
      class="flex flex-col gap-4 py-8"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="flex items-center gap-4"
      >
        <Skeleton class="bg-surface h-24 w-24" />
        <div class="flex-1 space-y-2">
          <Skeleton class="bg-surface h-4 w-3/4" />
          <Skeleton class="bg-surface h-3 w-1/2" />
          <div class="flex items-center justify-between pt-2">
            <Skeleton class="bg-surface h-8 w-24" />
            <Skeleton class="bg-surface h-4 w-16" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="items.length === 0"
      class="flex flex-col items-center justify-center gap-6 py-20 text-center"
    >
      <div class="border-border-noir bg-surface border p-6">
        <HeartIcon class="text-gold/60 h-10 w-10" />
      </div>
      <div class="space-y-2">
        <h3 class="font-display text-text text-2xl font-light">
          Your wishlist is empty
        </h3>
        <p class="text-text-muted text-sm">Add products to your wishlist</p>
      </div>
      <div class="bg-gold/40 mx-auto h-px w-24" />
      <RouterLink to="/shop">
        <Button
          class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
        >
          Continue browsing
        </Button>
      </RouterLink>
    </div>

    <div
      v-else
      class="flex flex-col gap-6"
    >
      <div
        v-if="!!shareToken"
        class="border-gold/30 bg-surface flex flex-col gap-4 border p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="border-gold/30 bg-noir border p-2">
            <Share2Icon class="text-gold h-5 w-5" />
          </div>
          <div>
            <h3 class="font-display text-text text-lg font-light">
              Viewing a Shared Wishlist
            </h3>
            <p class="text-text-muted text-sm">
              Updates are synced in real-time. You cannot edit this wishlist
              directly.
            </p>
          </div>
        </div>

        <div class="flex gap-2">
          <LoadingButton
            :loading="isImportingSharedWishlist"
            :disabled="isAnyActionInProgress"
            class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
            @click="importSharedWishlist"
          >
            <ImportIcon class="mr-2 h-4 w-4" />
            Import to my wishlist
          </LoadingButton>
        </div>
      </div>

      <div
        class="border-border-noir flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex flex-col gap-2">
          <p class="text-gold text-xs tracking-[0.3em] uppercase">
            {{ shareToken ? 'Shared' : 'Saved' }}
          </p>
          <h1 class="font-display text-text text-5xl font-light">
            Wishlist
            <span class="text-text-muted text-xl">({{ items.length }})</span>
          </h1>
          <p
            v-if="lastModified"
            class="text-text-muted text-sm"
          >
            Last modified {{ formatRelativeTime(lastModified) }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <template v-if="!shareToken">
            <LoadingButton
              :loading="isLoadingShareToken"
              :disabled="isAnyActionInProgress"
              class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
              @click="shareWishlist"
            >
              <Share2Icon class="h-4 w-4" />
              <span class="hidden sm:block">Share</span>
            </LoadingButton>

            <LoadingButton
              :loading="isClearingWishlist"
              :disabled="isAnyActionInProgress"
              class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
              @click="clearWishlist()"
            >
              <Trash2Icon class="h-4 w-4" />
              <span class="hidden md:block">Clear wishlist</span>
              <span class="md:hidden">Clear</span>
            </LoadingButton>
          </template>

          <template v-else>
            <RouterLink to="/wishlist">
              <Button
                class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
              >
                Exit Shared View
              </Button>
            </RouterLink>
          </template>
        </div>
      </div>

      <div class="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow class="border-border-noir hover:bg-surface">
              <TableHead
                class="text-gold w-[50%] text-xs tracking-[0.3em] uppercase"
              >
                Product
              </TableHead>
              <TableHead
                class="text-gold text-center text-xs tracking-[0.3em] uppercase"
              >
                Price
              </TableHead>
              <TableHead
                class="text-gold text-right text-xs tracking-[0.3em] uppercase"
              ></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in items"
              :key="item.id"
              class="border-border-noir hover:bg-surface"
            >
              <TableCell>
                <div class="flex items-center gap-6 py-3">
                  <button
                    v-if="!shareToken"
                    @click="handleRemoveItem(item)"
                    class="hover:text-gold text-text-muted cursor-pointer transition-colors"
                    :disabled="isAnyActionInProgress"
                    :class="{
                      'animate-pulse': isRemoveActioning(
                        item.product.id,
                        item.productVariant?.id,
                      ),
                    }"
                    aria-label="Remove item"
                  >
                    <XIcon class="h-5 w-5" />
                  </button>
                  <button
                    v-else
                    @click="
                      handleToggleMyWishlist(
                        item.product.id,
                        item.productVariant?.id,
                      )
                    "
                    class="hover:text-gold text-text-muted cursor-pointer transition-colors"
                    :class="{
                      'text-gold': isInMyWishlist(
                        item.product.id,
                        item.productVariant?.id,
                      ),
                    }"
                    :disabled="isAnyActionInProgress"
                  >
                    <HeartIcon
                      class="h-5 w-5"
                      :class="{
                        'fill-current': isInMyWishlist(
                          item.product.id,
                          item.productVariant?.id,
                        ),
                        'animate-pulse': isWishlistActioning(
                          item.product.id,
                          item.productVariant?.id,
                        ),
                      }"
                    />
                  </button>
                  <RouterLink
                    :to="`/products/${item.product.slug}${item.productVariant ? `?${item.productVariant.productVariantOptions.map((option: any) => `${option.option.attribute.name}=${option.option.name}`).join('&')}` : ''}`"
                    class="flex items-center gap-4"
                  >
                    <div
                      class="border-border-noir bg-surface h-24 w-24 overflow-hidden border"
                    >
                      <img
                        :src="item.product.images[0]"
                        :alt="item.product.name"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div class="text-text text-base">
                        {{ item.product.name }}
                      </div>
                      <div v-if="!!item.productVariant">
                        <div
                          v-for="option in item.productVariant
                            .productVariantOptions"
                          :key="option.id"
                          class="text-text-muted text-sm"
                        >
                          <span class="text-text">
                            {{ option.option.attribute.name }}:
                          </span>
                          <span>{{ option.option.name }}</span>
                        </div>
                      </div>
                    </div>
                  </RouterLink>
                </div>
              </TableCell>
              <TableCell class="text-center">
                <div class="text-text text-base">
                  <span
                    v-if="needsVariantSelection(item)"
                    class="text-text-muted"
                  >
                    From
                  </span>
                  {{ formatPrice(getItemPrice(item)) }}
                </div>
              </TableCell>
              <TableCell class="text-right">
                <div
                  v-if="needsVariantSelection(item)"
                  class="flex w-full justify-end"
                >
                  <RouterLink
                    :to="`/products/${item.product.slug}`"
                    class="flex w-fit items-center"
                  >
                    <Button
                      variant="link"
                      class="text-gold"
                    >
                      <ArrowLeftIcon class="h-4 w-4" />
                      Select options
                    </Button>
                  </RouterLink>
                </div>

                <div
                  v-else-if="isInCart(item.product.id, item.productVariant?.id)"
                  class="text-gold"
                >
                  <span class="flex items-center justify-end gap-2">
                    <CheckIcon class="h-4 w-4" />
                    Already in cart
                  </span>
                </div>

                <LoadingButton
                  v-else
                  :loading="
                    isCartActioning(item.product.id, item.productVariant?.id)
                  "
                  @click="handleAddCartItem(item)"
                  :disabled="isAnyActionInProgress"
                  class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
                >
                  Add to cart
                </LoadingButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div class="space-y-8 md:hidden">
        <div
          class="text-gold border-border-noir border-b pb-2 text-xs tracking-[0.3em] uppercase"
        >
          Product
        </div>

        <div
          v-for="item in items"
          :key="item.id"
          class="border-border-noir flex flex-col gap-4 border-b pb-8 last:border-0"
        >
          <div class="flex items-center gap-4">
            <button
              v-if="!shareToken"
              @click="handleRemoveItem(item)"
              class="hover:text-gold text-text-muted cursor-pointer transition-colors"
              :disabled="isAnyActionInProgress"
              :class="{
                'animate-pulse': isRemoveActioning(
                  item.product.id,
                  item.productVariant?.id,
                ),
              }"
              aria-label="Remove item"
            >
              <XIcon class="h-5 w-5" />
            </button>
            <button
              v-else
              @click="
                handleToggleMyWishlist(item.product.id, item.productVariant?.id)
              "
              class="hover:text-gold text-text-muted cursor-pointer transition-colors"
              :class="{
                'text-gold': isInMyWishlist(
                  item.product.id,
                  item.productVariant?.id,
                ),
              }"
              :disabled="isAnyActionInProgress"
            >
              <HeartIcon
                class="h-5 w-5"
                :class="{
                  'fill-current': isInMyWishlist(
                    item.product.id,
                    item.productVariant?.id,
                  ),
                  'animate-pulse': isWishlistActioning(
                    item.product.id,
                    item.productVariant?.id,
                  ),
                }"
              />
            </button>

            <div
              class="border-border-noir bg-surface h-20 w-20 shrink-0 overflow-hidden border"
            >
              <img
                :src="item.product.images[0]"
                :alt="item.product.name"
                class="h-full w-full object-cover"
              />
            </div>

            <div class="flex flex-col justify-center gap-1">
              <div class="text-text text-base">
                {{ item.product.name }}
              </div>
              <div
                v-if="item.productVariant"
                class="text-text-muted text-sm"
              >
                <span
                  v-for="(option, index) in item.productVariant
                    .productVariantOptions"
                  :key="option.id"
                >
                  {{ option.option.attribute.name }}: {{ option.option.name }}
                  <span
                    v-if="
                      index <
                      item.productVariant.productVariantOptions.length - 1
                    "
                  ></span>
                </span>
              </div>
              <div class="text-text mt-1">
                <span
                  v-if="needsVariantSelection(item)"
                  class="text-text-muted"
                >
                  From
                </span>
                {{ formatPrice(getItemPrice(item)) }}
              </div>
            </div>
          </div>

          <div
            v-if="needsVariantSelection(item)"
            class="flex w-full justify-end"
          >
            <RouterLink
              :to="`/products/${item.product.slug}`"
              class="flex w-fit items-center"
            >
              <Button
                variant="link"
                class="text-gold"
              >
                <ArrowLeftIcon class="h-4 w-4" />
                Select options
              </Button>
            </RouterLink>
          </div>

          <div
            v-else-if="isInCart(item.product.id, item.productVariant?.id)"
            class="border-gold/40 text-gold flex h-10 w-full items-center justify-center gap-2 border"
          >
            <CheckIcon class="h-4 w-4" />
            Already in cart
          </div>

          <LoadingButton
            v-else
            :loading="isCartActioning(item.product.id, item.productVariant?.id)"
            @click="handleAddCartItem(item)"
            :disabled="isAnyActionInProgress"
            class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
          >
            Add to cart
          </LoadingButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
