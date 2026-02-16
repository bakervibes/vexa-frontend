<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useCarts } from '@/composables/useCarts'
import { formatPrice } from '@/utils/lib'
import { Minus, Plus, ShoppingCartIcon, Trash2Icon } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const {
  cartSubtotal,
  isCartEmpty,
  isLoadingCart,
  cartItemsCount,
  cartItems,
  isRemovingCartItem,
  isClearingCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = useCarts()

const pendingQuantities = ref<
  Map<
    string,
    {
      quantity: number
      original: number
      timer: ReturnType<typeof setTimeout> | null
    }
  >
>(new Map())
const updatingItemId = ref<string | null>(null)
const removingItemId = ref<string | null>(null)
const editingItemId = ref<string | null>(null)

const isDrawerOpen = ref(false)
const showRemoveItemDialog = ref(false)
const showClearCartDialog = ref(false)

const itemToRemove = ref<{
  itemId: string
  productName: string
} | null>(null)

const getItemKey = (productId: string, variantId?: string | null) => {
  return `${productId}-${variantId ?? 'no-variant'}`
}

const findCartItem = (productId: string, variantId?: string | null) => {
  return cartItems.value.find(
    (item) =>
      item.productId === productId &&
      (item.productVariantId ?? null) === (variantId ?? null),
  )
}

const getMaxQuantity = (productId: string, variantId?: string | null) => {
  const item = findCartItem(productId, variantId)
  if (!item) return 0
  const remainingStock = item.productVariant?.stock ?? item.product?.stock ?? 0
  return item.quantity + remainingStock
}

const getDisplayQuantity = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)
  const cartItem = findCartItem(productId, variantId)

  return pendingQuantities.value.get(key)?.quantity ?? cartItem?.quantity ?? 1
}

const isItemUpdating = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)
  return updatingItemId.value === key
}

const isItemRemoving = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)
  return removingItemId.value === key
}

const isItemDisabled = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)

  return (
    (editingItemId.value !== null && editingItemId.value !== key) ||
    (updatingItemId.value !== null && updatingItemId.value !== key) ||
    (removingItemId.value !== null && removingItemId.value !== key)
  )
}

const isGlobalActionDisabled = computed(() => {
  return (
    editingItemId.value !== null ||
    updatingItemId.value !== null ||
    removingItemId.value !== null ||
    isClearingCart.value
  )
})

const handleQuantityChange = (
  productId: string,
  newQuantity: number,
  variantId?: string | null,
) => {
  if (newQuantity < 1) return

  const cartItem = findCartItem(productId, variantId)
  if (!cartItem) return

  const key = getItemKey(productId, variantId)
  const existing = pendingQuantities.value.get(key)

  if (existing?.timer) {
    clearTimeout(existing.timer)
  }

  const originalQuantity = existing?.original ?? cartItem.quantity

  if (newQuantity === originalQuantity) {
    pendingQuantities.value.delete(key)
    editingItemId.value = null
    return
  }

  editingItemId.value = key

  const timer = setTimeout(async () => {
    const pending = pendingQuantities.value.get(key)

    if (pending && pending.quantity !== pending.original) {
      updatingItemId.value = key
      try {
        await updateCartItem(cartItem.id, pending.quantity)
      } finally {
        updatingItemId.value = null
      }
    }

    editingItemId.value = null
  }, 2000)

  pendingQuantities.value.set(key, {
    quantity: newQuantity,
    original: originalQuantity,
    timer,
  })
}

const openRemoveItemDialog = (
  productId: string,
  variantId?: string | null,
  productName?: string,
) => {
  const cartItem = findCartItem(productId, variantId)
  if (!cartItem) return

  itemToRemove.value = {
    itemId: cartItem.id,
    productName: productName ?? 'this item',
  }
  showRemoveItemDialog.value = true
}

const confirmRemoveItem = async () => {
  if (!itemToRemove.value) return

  const { itemId } = itemToRemove.value

  pendingQuantities.value.forEach((pending, key) => {
    if (pending?.timer) {
      clearTimeout(pending.timer)
    }
  })

  removingItemId.value = itemId

  try {
    await removeCartItem(itemId)
  } finally {
    removingItemId.value = null
    itemToRemove.value = null
    showRemoveItemDialog.value = false
  }
}

const cancelRemoveItem = () => {
  showRemoveItemDialog.value = false
  itemToRemove.value = null
}

const openClearCartDialog = () => {
  showClearCartDialog.value = true
}

const confirmClearCart = async () => {
  pendingQuantities.value.forEach((pending) => {
    if (pending.timer) {
      clearTimeout(pending.timer)
    }
  })
  pendingQuantities.value.clear()
  editingItemId.value = null

  try {
    await clearCart()
  } finally {
    showClearCartDialog.value = false
  }
}

const cancelClearCart = () => {
  showClearCartDialog.value = false
}

const getItemPrice = (item: (typeof cartItems.value)[0]) => {
  return (
    item.productVariant?.price ??
    item.productVariant?.basePrice ??
    item.product?.price ??
    item.product?.basePrice ??
    0
  )
}
</script>

<template>
  <Sheet v-model:open="isDrawerOpen">
    <SheetTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Shopping Cart"
        class="hover:text-gold text-text relative p-2 hover:bg-transparent"
      >
        <ShoppingCartIcon class="size-5" />
        <span
          v-if="cartItemsCount > 0"
          class="bg-gold text-noir absolute -top-1.5 -right-1.5 flex items-center justify-center px-1 py-0.5 text-[10px] font-bold"
        >
          {{ cartItemsCount }}
        </span>
      </Button>
    </SheetTrigger>
    <SheetContent
      side="right"
      class="text-text bg-noir border-border-noir flex h-full w-full flex-col border-l sm:max-w-100"
    >
      <SheetHeader class="border-border-noir border-b pb-4 text-start">
        <SheetTitle class="font-display text-text text-2xl tracking-wide">
          My Cart
          <span class="text-gold ml-2 text-xs tracking-[0.3em] uppercase">
            ({{ cartItemsCount }})
          </span>
        </SheetTitle>
      </SheetHeader>

      <!-- Loading State -->
      <div
        v-if="isLoadingCart"
        class="flex flex-1 flex-col gap-4 py-4"
      >
        <div
          v-for="i in 3"
          :key="i"
          class="flex items-center gap-4"
        >
          <Skeleton class="bg-surface h-20 w-20" />
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

      <!-- Empty Cart State -->
      <div
        v-else-if="isCartEmpty"
        class="flex flex-1 flex-col items-center justify-center gap-6 py-4 text-center"
      >
        <div class="border-border-noir bg-surface border p-6">
          <ShoppingCartIcon class="text-text-muted size-10" />
        </div>
        <div class="space-y-2">
          <h3 class="font-display text-text text-xl">Your cart is empty</h3>
          <p class="text-text-muted text-sm">Add products to start shopping</p>
        </div>
        <Button
          class="border-gold/40 text-gold hover:bg-gold hover:text-noir border bg-transparent px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
          @click="isDrawerOpen = false"
        >
          Continue shopping
        </Button>
      </div>

      <!-- Cart Items -->
      <section
        v-else
        class="no-scrollbar h-full flex-1 overflow-y-auto"
      >
        <div class="flex flex-col">
          <div
            v-for="(item, index) in cartItems"
            :key="item.id"
            class="flex gap-3 py-5"
            :class="{
              'border-border-noir border-b': index < cartItems.length - 1,
            }"
          >
            <RouterLink
              :to="`/products/${item.product.slug}${item.productVariant ? `?${item.productVariant.productVariantOptions.map((option) => `${option.option.attribute.name}=${option.option.name}`).join('&')}` : ''}`"
              class="border-border-noir bg-surface relative h-30 w-26 shrink-0 overflow-hidden border"
              @click="isDrawerOpen = false"
            >
              <img
                :src="item.product.images[0]"
                :alt="item.product.name"
                class="h-full w-full object-cover"
              />
            </RouterLink>

            <div class="flex w-full gap-4">
              <div class="flex w-2/3 flex-col gap-1">
                <RouterLink
                  :to="`/products/${item.product.slug}${item.productVariant ? `?${item.productVariant.productVariantOptions.map((option) => `${option.option.attribute.name}=${option.option.name}`).join('&')}` : ''}`"
                  class="hover:text-gold text-text line-clamp-2 font-medium transition-colors"
                  @click="isDrawerOpen = false"
                >
                  {{ item.product.name }}
                </RouterLink>

                <p
                  v-if="item.productVariant"
                  class="text-text-muted flex flex-col text-xs"
                >
                  <span
                    v-if="item.productVariant.productVariantOptions.length > 0"
                  >
                    {{
                      item.productVariant.productVariantOptions[0]?.option
                        .attribute.name
                    }}:
                    {{
                      item.productVariant.productVariantOptions[0]?.option.name
                    }}
                  </span>
                  <span
                    v-if="item.productVariant.productVariantOptions.length > 1"
                    class="w-fit"
                  >
                    +{{ item.productVariant.productVariantOptions.length - 1 }}
                    more
                  </span>
                </p>

                <div
                  class="border-border-noir bg-surface flex w-fit items-center border"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    class="hover:text-gold text-text-muted size-7 p-0 hover:bg-transparent"
                    @click="
                      handleQuantityChange(
                        item.productId,
                        getDisplayQuantity(
                          item.productId,
                          item.productVariantId,
                        ) - 1,
                        item.productVariantId,
                      )
                    "
                    :disabled="
                      getDisplayQuantity(
                        item.productId,
                        item.productVariantId,
                      ) <= 1 ||
                      isItemDisabled(item.productId, item.productVariantId) ||
                      isItemUpdating(item.productId, item.productVariantId) ||
                      isItemRemoving(item.productId, item.productVariantId)
                    "
                  >
                    <Minus class="size-3" />
                  </Button>
                  <span
                    class="text-text relative flex w-8 items-center justify-center text-center text-sm"
                  >
                    {{
                      getDisplayQuantity(item.productId, item.productVariantId)
                    }}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="hover:text-gold text-text-muted size-7 p-0 hover:bg-transparent"
                    @click="
                      handleQuantityChange(
                        item.productId,
                        getDisplayQuantity(
                          item.productId,
                          item.productVariantId,
                        ) + 1,
                        item.productVariantId,
                      )
                    "
                    :disabled="
                      getDisplayQuantity(
                        item.productId,
                        item.productVariantId,
                      ) >=
                        getMaxQuantity(item.productId, item.productVariantId) ||
                      isItemDisabled(item.productId, item.productVariantId) ||
                      isItemUpdating(item.productId, item.productVariantId) ||
                      isItemRemoving(item.productId, item.productVariantId)
                    "
                  >
                    <Plus class="size-3" />
                  </Button>
                </div>
              </div>

              <div class="flex w-1/3 flex-col items-end gap-1">
                <p class="text-gold text-sm font-medium">
                  {{ formatPrice(getItemPrice(item)) }}
                </p>

                <Button
                  variant="ghost"
                  size="icon"
                  @click="
                    openRemoveItemDialog(
                      item.productId,
                      item.productVariantId,
                      item.product?.name,
                    )
                  "
                  :disabled="
                    editingItemId !== null ||
                    updatingItemId !== null ||
                    removingItemId !== null
                  "
                  class="hover:text-gold text-text-muted cursor-pointer p-1 hover:bg-transparent"
                >
                  <Trash2Icon class="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Cart Footer -->
      <div
        v-if="!isCartEmpty"
        class="border-border-noir flex flex-col gap-4 border-t p-4"
      >
        <div class="flex justify-between text-base">
          <span class="text-gold text-xs tracking-[0.3em] uppercase">
            Total
          </span>
          <span class="font-display text-text text-xl">
            {{ formatPrice(cartSubtotal) }}
          </span>
        </div>

        <div class="grid w-full grid-cols-2 gap-3">
          <LoadingButton
            :loading="isClearingCart"
            class="hover:text-text text-text-muted border-border-noir hover:bg-surface w-full border bg-transparent px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
            @click="openClearCartDialog"
            :disabled="isGlobalActionDisabled"
          >
            <Trash2Icon class="mr-2 size-4" />
            Clear
          </LoadingButton>

          <RouterLink
            to="/checkout"
            @click="isDrawerOpen = false"
            class="w-full"
          >
            <Button
              class="border-gold/40 text-gold hover:bg-gold hover:text-noir w-full border bg-transparent px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
            >
              Checkout
            </Button>
          </RouterLink>
        </div>

        <div class="flex justify-center">
          <RouterLink
            to="/cart"
            class="hover:text-gold text-text-muted text-xs tracking-[0.2em] uppercase transition-colors"
            @click="isDrawerOpen = false"
          >
            View cart
          </RouterLink>
        </div>
      </div>
    </SheetContent>
  </Sheet>

  <!-- Remove Item Dialog -->
  <Dialog v-model:open="showRemoveItemDialog">
    <DialogContent
      class="text-text bg-noir border-border-noir border sm:max-w-[425px]"
    >
      <DialogHeader>
        <DialogTitle class="font-display text-text text-xl">
          Remove item from cart?
        </DialogTitle>
        <DialogDescription class="text-text-muted">
          Are you sure you want to remove "{{ itemToRemove?.productName }}" from
          your cart? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2">
        <Button
          class="hover:text-text text-text-muted border-border-noir hover:bg-surface border bg-transparent px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
          @click="cancelRemoveItem"
          :disabled="isRemovingCartItem"
        >
          Cancel
        </Button>
        <LoadingButton
          :loading="isRemovingCartItem"
          :disabled="isRemovingCartItem"
          class="border-gold/40 text-gold hover:bg-gold hover:text-noir border bg-transparent px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
          @click="confirmRemoveItem"
        >
          Remove
        </LoadingButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Clear Cart Dialog -->
  <Dialog v-model:open="showClearCartDialog">
    <DialogContent
      class="text-text bg-noir border-border-noir border sm:max-w-[425px]"
    >
      <DialogHeader>
        <DialogTitle class="font-display text-text text-xl">
          Clear your cart?
        </DialogTitle>
        <DialogDescription class="text-text-muted">
          Are you sure you want to remove all items from your cart? This action
          cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="gap-2">
        <Button
          class="hover:text-text text-text-muted border-border-noir hover:bg-surface border bg-transparent px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
          @click="cancelClearCart"
          :disabled="isClearingCart"
        >
          Cancel
        </Button>
        <LoadingButton
          :loading="isClearingCart"
          :disabled="isClearingCart"
          class="border-gold/40 text-gold hover:bg-gold hover:text-noir border bg-transparent px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
          @click="confirmClearCart"
        >
          Clear cart
        </LoadingButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
