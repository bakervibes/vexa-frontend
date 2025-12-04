<script setup lang="ts">
import LoadingButton from '@/components/custom/loading-button.vue'
import { useCarts, useCartsMutation } from '@/composables/useCarts'
import { formatPrice } from '@/utils/lib'
import { Minus, Plus, ShoppingCartIcon, Trash2Icon } from 'lucide-vue-next'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Drawer from 'primevue/drawer'
import Skeleton from 'primevue/skeleton'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const { subtotal, isEmpty, isLoadingCart, itemCount, items } = useCarts()

const {
  isRemovingCartItem,
  isClearingCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = useCartsMutation()

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
  productId: string
  variantId?: string | null
  slug?: string
  productName: string
} | null>(null)

const getItemKey = (productId: string, variantId?: string | null) => {
  return `${productId}-${variantId ?? 'no-variant'}`
}

const getMaxQuantity = (productId: string, variantId?: string | null) => {
  const item = items.value.find(
    (item) =>
      item.productId === productId &&
      (item.variantId ?? null) === (variantId ?? null),
  )
  if (!item) return 0
  // Get remaining stock (what's still available to add)
  const remainingStock = item.variant?.stock ?? item.product?.stock ?? 0
  // Max quantity = current quantity in cart + remaining stock available
  return item.quantity + remainingStock
}

const getDisplayQuantity = (productId: string, variantId?: string | null) => {
  const key = getItemKey(productId, variantId)

  return (
    pendingQuantities.value.get(key)?.quantity ??
    items.value.find(
      (item) =>
        item.productId === productId &&
        (item.variantId ?? null) === (variantId ?? null),
    )?.quantity ??
    1
  )
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

const isGlobalActionDisabled = () => {
  return (
    editingItemId.value !== null ||
    updatingItemId.value !== null ||
    removingItemId.value !== null ||
    isClearingCart.value
  )
}

const handleQuantityChange = (
  productId: string,
  newQuantity: number,
  variantId?: string | null,
  slug?: string,
) => {
  if (newQuantity < 1) return

  const key = getItemKey(productId, variantId)
  const existing = pendingQuantities.value.get(key)

  if (existing?.timer) {
    clearTimeout(existing.timer)
  }

  const originalQuantity =
    existing?.original ??
    items.value.find(
      (item) =>
        item.productId === productId &&
        (item.variantId ?? null) === (variantId ?? null),
    )?.quantity ??
    newQuantity

  // If the new quantity equals the original, cancel immediately and reset state
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
        await updateCartItem(
          productId,
          pending.quantity,
          variantId ?? undefined,
          slug,
        )
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
  slug?: string,
  productName?: string,
) => {
  itemToRemove.value = {
    productId,
    variantId,
    slug,
    productName: productName ?? 'this item',
  }
  showRemoveItemDialog.value = true
}

const confirmRemoveItem = async () => {
  if (!itemToRemove.value) return

  const { productId, variantId, slug } = itemToRemove.value
  const key = getItemKey(productId, variantId ?? null)

  const pending = pendingQuantities.value.get(key)

  if (pending?.timer) {
    clearTimeout(pending.timer)
    pendingQuantities.value.delete(key)
  }

  if (editingItemId.value === key) {
    editingItemId.value = null
  }

  removingItemId.value = key

  try {
    await removeCartItem(productId, variantId ?? undefined, slug)
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
    await clearCart(items.value.map((item) => item.product.slug))
  } finally {
    showClearCartDialog.value = false
  }
}

const cancelClearCart = () => {
  showClearCartDialog.value = false
}
</script>

<template>
  <Button
    type="button"
    text
    class="relative hover:bg-transparent"
    @click="isDrawerOpen = true"
  >
    <ShoppingCartIcon class="size-5" />
    <span
      v-if="itemCount > 0"
      class="bg-primary absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold text-white"
    >
      {{ itemCount }}
    </span>
  </Button>

  <Drawer
    v-model:visible="isDrawerOpen"
    position="right"
    header="My Cart"
    :style="{ width: '25rem' }"
    class="flex h-full flex-col"
  >
    <template #header>
      <span class="text-lg font-semibold">My Cart ({{ itemCount }})</span>
    </template>

    <div
      v-if="isLoadingCart"
      class="flex flex-1 flex-col gap-4 py-4"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="flex items-center gap-4"
      >
        <Skeleton
          width="5rem"
          height="5rem"
          class="rounded-md"
        />
        <div class="flex-1 space-y-2">
          <Skeleton
            width="75%"
            height="1rem"
          />
          <Skeleton
            width="50%"
            height="0.75rem"
          />
          <div class="flex items-center justify-between pt-2">
            <Skeleton
              width="6rem"
              height="2rem"
            />
            <Skeleton
              width="4rem"
              height="1rem"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="isEmpty"
      class="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center"
    >
      <div class="rounded-full bg-gray-100 p-6">
        <ShoppingCartIcon class="size-10 text-gray-400" />
      </div>
      <div class="space-y-1">
        <h3 class="font-semibold">Your cart is empty</h3>
        <p class="text-sm text-gray-500">Add products to start shopping</p>
      </div>
      <Button
        outlined
        class="mt-4"
        @click="isDrawerOpen = false"
      >
        Continue shopping
      </Button>
    </div>

    <section
      v-else
      class="no-scrollbar h-full flex-1 overflow-y-auto"
    >
      <div class="flex flex-col">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex gap-3 border-b py-6"
        >
          <RouterLink
            :to="`/products/${item.product.slug}${item.variant && `?${item.variant.productVariantOptions.map((option) => `${option.option.attribute.name}=${option.option.name}`).join('&')}`}`"
            class="relative h-30 w-26 shrink-0 overflow-hidden border bg-gray-100"
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
                :to="`/products/${item.product.slug}${item.variant && `?${item.variant.productVariantOptions.map((option) => `${option.option.attribute.name}=${option.option.name}`).join('&')}`}`"
                class="line-clamp-2 font-medium"
                @click="isDrawerOpen = false"
              >
                {{ item.product.name }}
              </RouterLink>

              <p
                v-if="item.variant"
                class="flex flex-col text-xs text-gray-500"
              >
                <span v-if="item.variant.productVariantOptions.length > 0">
                  {{
                    item.variant.productVariantOptions[0]?.option.attribute
                      .name
                  }}:
                  {{ item.variant.productVariantOptions[0]?.option.name }}
                </span>
                <span
                  v-if="item.variant.productVariantOptions.length > 1"
                  class="w-fit text-gray-500"
                >
                  +{{ item.variant.productVariantOptions.length - 1 }} more
                </span>
              </p>

              <div class="flex w-fit items-center rounded border">
                <Button
                  text
                  size="small"
                  class="!h-6 !w-6 rounded-none rounded-l"
                  @click="
                    handleQuantityChange(
                      item.productId,
                      getDisplayQuantity(item.productId, item.variantId) - 1,
                      item.variantId ?? undefined,
                      item.product?.slug,
                    )
                  "
                  :disabled="
                    getDisplayQuantity(item.productId, item.variantId) <= 1 ||
                    isItemDisabled(item.productId, item.variantId) ||
                    isItemUpdating(item.productId, item.variantId) ||
                    isItemRemoving(item.productId, item.variantId)
                  "
                >
                  <Minus class="size-3" />
                </Button>
                <span
                  class="relative flex w-8 items-center justify-center text-center text-sm"
                >
                  <span>
                    {{ getDisplayQuantity(item.productId, item.variantId) }}
                  </span>
                </span>
                <Button
                  text
                  size="small"
                  class="!h-6 !w-6 rounded-none rounded-r"
                  @click="
                    handleQuantityChange(
                      item.productId,
                      getDisplayQuantity(item.productId, item.variantId) + 1,
                      item.variantId ?? undefined,
                      item.product?.slug,
                    )
                  "
                  :disabled="
                    getDisplayQuantity(item.productId, item.variantId) >=
                      getMaxQuantity(item.productId, item.variantId) ||
                    isItemDisabled(item.productId, item.variantId) ||
                    isItemUpdating(item.productId, item.variantId) ||
                    isItemRemoving(item.productId, item.variantId)
                  "
                >
                  <Plus class="size-3" />
                </Button>
              </div>
            </div>

            <div class="flex w-1/3 flex-col items-end gap-1">
              <p class="text-sm font-medium">
                {{
                  formatPrice(
                    item.variant?.price ??
                      item.variant?.basePrice ??
                      item.product.price ??
                      item.product.basePrice ??
                      0,
                  )
                }}
              </p>

              <Button
                text
                size="small"
                @click="
                  openRemoveItemDialog(
                    item.productId,
                    item.variantId ?? undefined,
                    item.product?.slug,
                    item.product?.name,
                  )
                "
                :disabled="
                  isItemDisabled(item.productId, item.variantId) ||
                  isItemRemoving(item.productId, item.variantId)
                "
                class="cursor-pointer p-1 text-red-500 hover:text-red-600"
              >
                <Trash2Icon class="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <template
      #footer
      v-if="!isEmpty"
    >
      <div class="flex flex-col gap-2">
        <div class="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>{{ formatPrice(subtotal) }}</span>
        </div>

        <div class="grid w-full grid-cols-2 gap-2">
          <LoadingButton
            :loading="isClearingCart"
            outlined
            class="w-full"
            @click="openClearCartDialog"
            size="large"
            :disabled="isGlobalActionDisabled()"
          >
            <Trash2Icon class="size-4" />
            Clear cart
          </LoadingButton>

          <RouterLink
            to="/checkout"
            @click="isDrawerOpen = false"
          >
            <Button
              class="w-full"
              size="large"
            >
              Checkout
            </Button>
          </RouterLink>
        </div>

        <div class="flex justify-center">
          <RouterLink
            to="/cart"
            class="border-b border-black text-sm font-medium"
            @click="isDrawerOpen = false"
          >
            View cart
          </RouterLink>
        </div>
      </div>
    </template>
  </Drawer>

  <Dialog
    v-model:visible="showRemoveItemDialog"
    modal
    header="Remove item from cart?"
    :style="{ width: '25rem' }"
    :dismissableMask="true"
    @hide="cancelRemoveItem"
  >
    <p class="text-gray-600">
      Are you sure you want to remove "{{ itemToRemove?.productName }}" from
      your cart? This action cannot be undone.
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          outlined
          @click="cancelRemoveItem"
          :disabled="isRemovingCartItem"
        >
          Cancel
        </Button>
        <LoadingButton
          :loading="isRemovingCartItem"
          :disabled="isRemovingCartItem"
          severity="danger"
          @click="confirmRemoveItem"
        >
          Remove
        </LoadingButton>
      </div>
    </template>
  </Dialog>

  <Dialog
    v-model:visible="showClearCartDialog"
    modal
    header="Clear your cart?"
    :style="{ width: '25rem' }"
    :dismissableMask="true"
    @hide="cancelClearCart"
  >
    <p class="text-gray-600">
      Are you sure you want to remove all items from your cart? This action
      cannot be undone.
    </p>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          outlined
          @click="cancelClearCart"
          :disabled="isClearingCart"
        >
          Cancel
        </Button>
        <LoadingButton
          :loading="isClearingCart"
          :disabled="isClearingCart"
          severity="danger"
          @click="confirmClearCart"
        >
          Clear cart
        </LoadingButton>
      </div>
    </template>
  </Dialog>
</template>
