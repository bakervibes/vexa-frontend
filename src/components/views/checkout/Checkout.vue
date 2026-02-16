<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import CustomSelect from '@/components/custom/custom-select.vue'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddresses } from '@/composables/useAddresses'
import { useAuth } from '@/composables/useAuth'
import { useCarts } from '@/composables/useCarts'
import { useCoupons } from '@/composables/useCoupons'
import { useOrders } from '@/composables/useOrders'
import { useSharedCart } from '@/composables/useSharedCarts'
import { cartsService } from '@/services/carts.service'
import { paymentService } from '@/services/payments.service'
import { PaymentProvider, ShippingType, type Address } from '@/types'
import { getAllCountries } from '@/utils/countries'
import { convertCurrency, formatPrice } from '@/utils/lib'
import {
  checkoutFormSchema,
  type CheckoutFormInput,
  type CreateOrderInput,
} from '@/validators/orders.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useClipboard } from '@vueuse/core'
import {
  addFailedListener,
  addKkiapayCloseListener,
  addSuccessListener,
  openKkiapayWidget,
} from 'kkiapay'
import {
  AlertTriangleIcon,
  CreditCardIcon,
  GlobeIcon,
  MapPinIcon,
  PlusIcon,
  Share2Icon,
  ShoppingCartIcon,
  TagIcon,
  TruckIcon,
  WalletIcon,
} from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const { copy } = useClipboard()
const { openAuthModal, isAuthenticated } = useAuth()
const { cartSubtotal, cartItems, isLoadingCart, isCartEmpty } = useCarts()
const {
  shareToken,
  sharedCartSubtotal,
  sharedCartItems,
  isLoadingShared,
  errorShared,
} = useSharedCart()

// Share checkout state
const isSharingCheckout = ref(false)

const subtotal = computed(() =>
  !!shareToken.value ? sharedCartSubtotal.value : cartSubtotal.value,
)
const items = computed(() =>
  !!shareToken.value ? sharedCartItems.value : cartItems.value,
)
const isLoading = computed(() =>
  !!shareToken.value ? isLoadingShared.value : isLoadingCart.value,
)
const isEmpty = computed(() =>
  !!shareToken.value ? sharedCartItems.value.length === 0 : isCartEmpty.value,
)

const { createOrder, isCreatingOrder } = useOrders()
const { defaultAddress, addresses, createAddress } = useAddresses()
const {
  couponCode,
  appliedCoupon,
  hasAppliedCoupon,
  isApplyingCoupon,
  applyCoupon,
  removeCoupon,
  discountAmount,
} = useCoupons({ cartSubtotal: subtotal })

// Shipping options
interface ShippingOption {
  id: string
  label: string
  price: number
  isPercentage?: boolean
}

const shippingOptions: ShippingOption[] = [
  { id: 'free', label: 'Free shipping', price: 0 },
  { id: 'express', label: 'Express shipping', price: 15 },
  { id: 'pickup', label: 'Pick Up', price: 21, isPercentage: true },
]

// State
const selectedShippingId = ref<string>('free')
const addressMode = ref<'existing' | 'new'>('existing')
const selectedAddressId = ref<string | null>(null)
const paymentMethod = ref<PaymentProvider>(PaymentProvider.STRIPE)

// Payment modal state

const { handleSubmit, setFieldValue, values } = useForm({
  validationSchema: toTypedSchema(checkoutFormSchema),
  initialValues: {
    address: {
      id: defaultAddress.value?.id ?? undefined,
      country: defaultAddress.value?.country ?? '',
      name: defaultAddress.value?.name ?? '',
      email: defaultAddress.value?.email ?? '',
      phone: defaultAddress.value?.phone ?? '',
      street: defaultAddress.value?.street ?? '',
      city: defaultAddress.value?.city ?? '',
    },
    payment: {
      provider: PaymentProvider.STRIPE,
      transactionId: Date.now().toString(),
      metadata: {},
    },
    coupon: null,
    shippingOption: {
      id: shippingOptions[0]!.id,
      label: shippingOptions[0]!.label,
      price: shippingOptions[0]!.price,
      isPercentage: shippingOptions[0]!.isPercentage ?? false,
    },
  },
})

// Initialize from URL on mount
onMounted(async () => {
  const couponParam = route.query.coupon as string

  if (couponParam) {
    setFieldValue('coupon', couponParam)
  }
})

watch(
  () => route.query.shipping,
  (shippingParam) => {
    if (typeof shippingParam === 'string') {
      const option = shippingOptions.find((o) => o.id === shippingParam)
      if (option) {
        selectedShippingId.value = shippingParam
        updateShippingInForm(option)
      }
    }
  },
  { immediate: true },
)

// Get the selected shipping option object
const selectedShippingOption = computed((): ShippingOption => {
  return (
    shippingOptions.find((o) => o.id === selectedShippingId.value) ??
    shippingOptions[0]!
  )
})

// Computed - Calculate shipping cost
const shippingCost = computed(() => {
  const option = selectedShippingOption.value
  if (option.isPercentage) {
    return (subtotal.value * option.price) / 100
  }
  return option.price
})

// Total = (subtotal - discount) + shipping
const total = computed(
  () =>
    subtotal.value -
    (appliedCoupon.value?.discountAmount ?? 0) +
    shippingCost.value,
)

// Helper functions for item prices
const getItemPrice = (item: (typeof items.value)[0]) => {
  return (
    item.productVariant?.price ??
    item.productVariant?.basePrice ??
    item.product?.price ??
    item.product?.basePrice ??
    0
  )
}

const getItemSubtotal = (item: (typeof items.value)[0]) => {
  return getItemPrice(item) * item.quantity
}

// Update shipping option in form
function updateShippingInForm(option: ShippingOption) {
  setFieldValue('shippingOption', {
    id: option.id,
    label: option.label,
    price: option.price,
    isPercentage: option.isPercentage ?? false,
  })
}

// Change shipping option
const changeShippingOption = (optionId: string) => {
  selectedShippingId.value = optionId
  const option = shippingOptions.find((o) => o.id === optionId)
  if (option) {
    updateShippingInForm(option)
    router.replace({ query: { ...route.query, shipping: optionId } })
  }
}

// Watch for default address and pre-fill form
watch(
  [defaultAddress, addresses],
  ([newDefault, newAddresses]) => {
    if (newDefault && addressMode.value === 'existing') {
      selectedAddressId.value = newDefault.id
      fillFormWithAddress(newDefault)
    } else if (
      newAddresses &&
      newAddresses.length > 0 &&
      !selectedAddressId.value
    ) {
      const firstAddress = newAddresses[0]
      if (firstAddress) {
        selectedAddressId.value = firstAddress.id
        fillFormWithAddress(firstAddress)
      }
    }
  },
  { immediate: true },
)

// Watch for address mode changes
watch(addressMode, (newMode) => {
  if (newMode === 'new') {
    setFieldValue('address', {
      id: undefined,
      name: '',
      email: '',
      street: '',
      city: '',
      country: '',
      phone: '',
    })
    selectedAddressId.value = null
  } else if (newMode === 'existing' && addresses.value.length > 0) {
    const addr = defaultAddress.value ?? addresses.value[0]
    if (addr) {
      selectedAddressId.value = addr.id
      fillFormWithAddress(addr)
    }
  }
})

// Watch for payment method changes
watch(paymentMethod, (newMethod) => {
  setFieldValue('payment.provider', newMethod)
})

// Watch for applied coupon changes and update form
watch(appliedCoupon, (newCoupon) => {
  if (newCoupon) {
    setFieldValue('coupon', newCoupon.code)
  } else {
    setFieldValue('coupon', null)
  }
})

// Fill form with address data
function fillFormWithAddress(address: Address) {
  setFieldValue('address', {
    id: address.id,
    name: address.name,
    email: address.email,
    street: address.street,
    city: address.city,
    country: address.country,
    phone: address.phone,
  })
}

// Handle address selection
function selectAddress(address: Address) {
  selectedAddressId.value = address.id
  fillFormWithAddress(address)
}

// Handlers
const handleApplyCoupon = async () => {
  await applyCoupon()
}

const _handleRemoveCoupon = () => {
  removeCoupon()
}

const onSubmit = handleSubmit(async (formValues: CheckoutFormInput) => {
  if (!isAuthenticated.value) {
    openAuthModal('login', () => {
      proceedWithOrder(formValues)
    })
    return
  }

  proceedWithOrder(formValues)
})

/**
 * Map shipping option ID to ShippingType enum
 */
const mapShippingOptionToType = (optionId: string): ShippingType => {
  switch (optionId) {
    case 'express':
      return ShippingType.EXPRESS
    case 'pickup':
      return ShippingType.PICKUP
    case 'free':
    default:
      return ShippingType.STANDARD
  }
}

const proceedWithOrder = async (formValues: CheckoutFormInput) => {
  try {
    // 1. Get or create address ID
    let addressId: string

    if (formValues.address.id) {
      // Use existing address
      addressId = formValues.address.id
    } else {
      // Create new address
      const newAddress = await createAddress({
        name: formValues.address.name,
        email: formValues.address.email,
        phone: formValues.address.phone,
        street: formValues.address.street,
        city: formValues.address.city,
        country: formValues.address.country,
        isDefault: false,
      })
      addressId = newAddress.id
    }

    // 2. Build order payload (API format)
    const orderPayload: CreateOrderInput = {
      addressId,
      shippingType: mapShippingOptionToType(formValues.shippingOption.id),
      couponCode: formValues.coupon || undefined,
    }

    // 3. Create the order (with PENDING status)
    const order = await createOrder(orderPayload)
    const orderId = order.id
    const provider = formValues.payment.provider

    // 4. Create payment session for the order
    const paymentData = await paymentService.createPaymentSession(
      orderId,
      provider,
    )

    // 5. Handle based on provider
    if (provider === PaymentProvider.KKIAPAY) {
      const amount = await convertCurrency(
        paymentData.totalAmount,
        'EUR',
        'XOF',
      )

      handleOpenKkiapayWidget(orderId, amount)
    } else if (paymentData.redirectUrl) {
      window.location.href = paymentData.redirectUrl
    } else {
      toast.error('Failed to get payment URL. Please try again.')
    }
  } catch (error) {
    console.error('Error placing order:', error)
    toast.error('Failed to place order. Please try again.')
  }
}

// Store current Kkiapay order ID for callback reference
const currentKkiapayOrderId = ref<string | null>(null)

// Handle Kkiapay widget opening
const handleOpenKkiapayWidget = (orderId: string, amount: number) => {
  // Store the orderId for the callback
  currentKkiapayOrderId.value = orderId

  // Open the Kkiapay widget using the imported function
  openKkiapayWidget({
    amount: Math.round(amount), // Kkiapay expects integer amount in XOF
    position: 'center',
    name: `${values.address?.name}`, // Assuming 'name' in address contains full name
    email: values.address?.email,
    phone: '97000000',
    data: JSON.stringify({ orderId }), // Pass orderId in data for reference
    theme: '#000000',
    key: import.meta.env.VITE_KKIAPAY_PUBLIC_KEY,
    sandbox: import.meta.env.VITE_ENV !== 'production',
  })
}

// Handle Kkiapay success callback
const handleKkiapaySuccess = async (response: { transactionId: string }) => {
  const orderId = currentKkiapayOrderId.value

  if (!orderId) {
    console.error('No orderId found for Kkiapay callback')
    toast.error('Payment error: Order not found')
    return
  }

  try {
    await paymentService.verifyKkiapay(orderId, response.transactionId)
    currentKkiapayOrderId.value = null
    onPaymentSuccess(orderId)
  } catch (error) {
    console.error('Kkiapay verification failed:', error)
    currentKkiapayOrderId.value = null
    onPaymentError('Payment verification failed')
  }
}

// Handle Kkiapay failure callback
const handleKkiapayFailed = (_data: { transactionId: string }) => {
  currentKkiapayOrderId.value = null
  toast.error('Payment failed. Please try again.')
}

// Handle Kkiapay widget close
const handleKkiapayClose = () => {
  // Only show message if there was an active payment
  if (currentKkiapayOrderId.value) {
    toast.info('Payment cancelled')
    currentKkiapayOrderId.value = null
  }
}

// Set up Kkiapay listeners on mount
onMounted(() => {
  addSuccessListener(handleKkiapaySuccess)
  addFailedListener(handleKkiapayFailed)
  addKkiapayCloseListener(handleKkiapayClose)
})

// Handle successful payment
const onPaymentSuccess = (orderId: string) => {
  toast.success('Payment successful!')
  router.push({
    name: 'complete',
    query: { orderId },
  })
}

// Handle payment error
const onPaymentError = (errorMsg: string) => {
  console.error('Payment error:', errorMsg)
  toast.error(errorMsg || 'Payment failed. Please try again.')
}

// Handle share checkout
const handleShareCheckout = async () => {
  if (isSharingCheckout.value) return

  try {
    isSharingCheckout.value = true

    // Create share token
    const data = await cartsService.shareCart()

    // Build URL with all existing query parameters plus the share token
    const params = new URLSearchParams()

    // Include all existing query parameters (shipping, coupon, etc.)
    Object.entries(route.query).forEach(([key, value]) => {
      if (key !== 'share' && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)))
        } else {
          params.set(key, String(value))
        }
      }
    })

    // Add coupon if applied
    if (hasAppliedCoupon.value && appliedCoupon.value) {
      params.set('coupon', appliedCoupon.value.code)
    }

    // Add shipping option
    if (selectedShippingId.value) {
      params.set('shipping', selectedShippingId.value)
    }

    // Add or replace the share token
    params.set('share', data.shareToken)

    const queryString = params.toString()
    const shareUrl = `${window.location.origin}/checkout?${queryString}`

    copy(shareUrl)
    toast.success('Checkout link copied to clipboard')
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Could not create share link'
    toast.error(message)
  } finally {
    isSharingCheckout.value = false
  }
}
</script>

<template>
  <!-- Loading State -->
  <div
    v-if="isLoading"
    class="flex flex-col gap-4 py-8"
  >
    <div
      v-for="i in 3"
      :key="i"
      class="flex items-center gap-4"
    >
      <Skeleton class="h-24 w-24" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-4 w-3/4" />
        <Skeleton class="h-3 w-1/2" />
        <div class="flex items-center justify-between pt-2">
          <Skeleton class="h-8 w-24" />
          <Skeleton class="h-4 w-16" />
        </div>
      </div>
    </div>
  </div>

  <!-- Shared Cart Error State -->
  <div
    v-else-if="errorShared"
    class="flex flex-col items-center justify-center gap-4 py-16 text-center"
  >
    <div class="border-gold/40 border p-6">
      <AlertTriangleIcon class="text-gold h-10 w-10" />
    </div>
    <div class="space-y-1">
      <h3 class="font-display text-text text-xl font-light">
        Unable to load shared cart
      </h3>
      <p class="text-text-muted text-sm">{{ errorShared.message }}</p>
    </div>
    <RouterLink to="/cart">
      <button
        class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
      >
        Return to my cart
      </button>
    </RouterLink>
  </div>

  <!-- Empty Cart State -->
  <div
    v-else-if="isEmpty"
    class="flex flex-col items-center justify-center gap-4 py-16 text-center"
  >
    <div class="border-border-noir border p-6">
      <ShoppingCartIcon class="text-text-muted h-10 w-10" />
    </div>
    <div class="space-y-1">
      <h3 class="font-display text-text text-xl font-light">
        Your cart is empty
      </h3>
      <p class="text-text-muted text-sm">Add products to start shopping</p>
    </div>
    <RouterLink to="/shop">
      <button
        class="border-gold/40 text-gold hover:bg-gold hover:text-noir border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
      >
        Continue shopping
      </button>
    </RouterLink>
  </div>

  <div
    v-else
    class="bg-noir flex flex-col gap-8"
  >
    <div
      v-if="!!shareToken"
      class="border-gold/40 bg-surface flex items-center gap-3 border p-4"
    >
      <div class="border-gold/40 border p-2">
        <TruckIcon class="text-gold h-5 w-5" />
      </div>
      <div>
        <h3 class="text-gold text-xs tracking-[0.3em] uppercase">
          Paying for a Shared Cart
        </h3>
        <p class="text-text-muted mt-1 text-sm">
          You are processing payment for a shared cart. The items and total
          amount are managed by the cart owner.
        </p>
      </div>
    </div>

    <div class="grid gap-8 lg:grid-cols-5">
      <!-- Left Column - Forms -->
      <div class="space-y-4 lg:col-span-3">
        <div
          v-if="!shareToken"
          class="flex justify-end"
        >
          <button
            :disabled="isSharingCheckout"
            @click="handleShareCheckout"
            class="border-gold/40 text-gold hover:bg-gold hover:text-noir flex items-center gap-2 border px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all disabled:opacity-50"
          >
            <Share2Icon class="h-4 w-4" />
            <span class="hidden sm:block">Share</span>
          </button>
        </div>

        <form @submit="onSubmit">
          <!-- Address Selection Section -->
          <div class="border-border-noir bg-surface mb-6 border p-6">
            <div class="bg-gold/40 mx-auto mb-6 h-px w-24"></div>
            <h2 class="font-display text-text mb-6 text-3xl font-light">
              Contact & Delivery Address
            </h2>

            <!-- Address Mode Selection -->
            <div class="mb-4 flex gap-4">
              <button
                type="button"
                @click="addressMode = 'existing'"
                class="flex items-center gap-2 px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
                :class="
                  addressMode === 'existing'
                    ? 'bg-gold text-noir'
                    : 'border-gold/40 text-gold hover:bg-gold hover:text-noir border'
                "
              >
                <MapPinIcon class="h-4 w-4" />
                Use Saved Address
              </button>
              <button
                type="button"
                @click="addressMode = 'new'"
                class="flex items-center gap-2 px-5 py-3 text-xs tracking-[0.2em] uppercase transition-all"
                :class="
                  addressMode === 'new'
                    ? 'bg-gold text-noir'
                    : 'border-gold/40 text-gold hover:bg-gold hover:text-noir border'
                "
              >
                <PlusIcon class="h-4 w-4" />
                New Address
              </button>
            </div>

            <!-- Saved Addresses List -->
            <div
              v-if="addressMode === 'existing'"
              class="mb-6 grid gap-3"
            >
              <div
                v-for="address in addresses"
                :key="address.id"
                @click="selectAddress(address)"
                class="flex cursor-pointer items-start gap-3 border p-4 transition-colors"
                :class="{
                  'border-gold bg-border-noir':
                    selectedAddressId === address.id,
                  'hover:border-gold/40 border-border-noir':
                    selectedAddressId !== address.id,
                }"
              >
                <div
                  class="mt-0.5 flex h-5 w-5 items-center justify-center border-2"
                  :class="{
                    'border-gold': selectedAddressId === address.id,
                    'border-text-muted': selectedAddressId !== address.id,
                  }"
                >
                  <div
                    v-if="selectedAddressId === address.id"
                    class="bg-gold h-2.5 w-2.5"
                  />
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-text">{{ address.name }}</span>
                    <span
                      v-if="address.isDefault"
                      class="border-gold/40 text-gold border px-2 py-0.5 text-xs tracking-[0.2em] uppercase"
                    >
                      Default
                    </span>
                  </div>
                  <p class="text-text-muted text-sm">
                    {{ address.street }}, {{ address.city }}
                  </p>
                  <p class="text-text-muted text-sm">{{ address.country }}</p>
                  <p
                    v-if="address.phone"
                    class="text-text-muted mt-1 text-sm"
                  >
                    {{ address.phone }}
                  </p>
                </div>
              </div>
            </div>

            <p
              v-if="addressMode === 'existing' && selectedAddressId"
              class="text-text-muted mb-4 text-sm"
            >
              You can modify the fields below. If you make changes, the address
              will be updated.
            </p>

            <div
              class="space-y-4"
              :class="{
                'mt-8': addressMode !== 'existing',
              }"
            >
              <FormField
                v-slot="{ componentField }"
                name="address.name"
              >
                <FormItem>
                  <CustomInput
                    v-bind="componentField"
                    label="Full Name *"
                    type="text"
                  />
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="address.email"
              >
                <FormItem>
                  <CustomInput
                    v-bind="componentField"
                    label="Email Address *"
                    type="email"
                  />
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="address.phone"
              >
                <FormItem>
                  <CustomPhoneInput
                    v-bind="componentField"
                    label="Phone Number *"
                  />
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="address.street"
              >
                <FormItem>
                  <CustomInput
                    v-bind="componentField"
                    label="Street Address *"
                    type="text"
                  />
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ value, handleChange }"
                name="address.country"
              >
                <FormItem>
                  <CustomSelect
                    :model-value="value"
                    @update:model-value="handleChange"
                    label="Country *"
                    :options="
                      getAllCountries().map((country) => ({
                        label: country.name,
                        value: country.name,
                      }))
                    "
                    search-placeholder="Search country..."
                    placeholder="Select a country"
                  />
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="address.city"
              >
                <FormItem>
                  <CustomInput
                    v-bind="componentField"
                    label="Town / City *"
                    type="text"
                  />
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>

          <!-- Shipping Method -->
          <div class="border-border-noir bg-surface mb-6 border p-6">
            <div class="bg-gold/40 mx-auto mb-6 h-px w-24"></div>
            <h2 class="font-display text-text mb-6 text-3xl font-light">
              Shipping Method
            </h2>

            <RadioGroup
              :model-value="selectedShippingId"
              @update:model-value="changeShippingOption"
              class="space-y-3"
            >
              <div
                v-for="option in shippingOptions"
                :key="option.id"
                class="flex cursor-pointer items-center justify-between border p-4 transition-colors"
                :class="{
                  'border-gold bg-border-noir':
                    selectedShippingId === option.id,
                  'hover:border-gold/40 border-border-noir':
                    selectedShippingId !== option.id,
                }"
                @click="changeShippingOption(option.id)"
              >
                <div class="flex items-center gap-3">
                  <RadioGroupItem
                    :id="option.id"
                    :value="option.id"
                  />
                  <Label
                    :for="option.id"
                    class="text-text cursor-pointer"
                  >
                    {{ option.label }}
                  </Label>
                </div>
                <span class="text-gold text-sm">
                  {{
                    option.price === 0
                      ? formatPrice(0)
                      : option.isPercentage
                        ? `${option.price}%`
                        : formatPrice(option.price)
                  }}
                </span>
              </div>
            </RadioGroup>

            <p class="text-text-muted mt-3 text-xs tracking-[0.2em] uppercase">
              Note: Shipping cost is not affected by coupon discounts.
            </p>
          </div>

          <!-- Payment Method -->
          <div class="border-border-noir bg-surface mb-6 border p-6">
            <div class="bg-gold/40 mx-auto mb-6 h-px w-24"></div>
            <h2 class="font-display text-text mb-6 text-3xl font-light">
              Payment method
            </h2>

            <RadioGroup
              v-model="paymentMethod"
              class="grid gap-3 sm:grid-cols-3"
            >
              <!-- Stripe -->
              <div
                class="flex cursor-pointer items-center justify-between border p-4 transition-colors"
                :class="{
                  'border-gold bg-border-noir':
                    paymentMethod === PaymentProvider.STRIPE,
                  'hover:border-gold/40 border-border-noir':
                    paymentMethod !== PaymentProvider.STRIPE,
                }"
                @click="paymentMethod = PaymentProvider.STRIPE"
              >
                <div class="flex items-center gap-3">
                  <RadioGroupItem
                    id="stripe"
                    :value="PaymentProvider.STRIPE"
                  />
                  <Label
                    for="stripe"
                    class="text-text cursor-pointer"
                  >
                    Credit Card
                  </Label>
                </div>
                <CreditCardIcon class="text-gold h-5 w-5" />
              </div>

              <!-- PayPal -->
              <div
                class="flex cursor-pointer items-center justify-between border p-4 transition-colors"
                :class="{
                  'border-gold bg-border-noir':
                    paymentMethod === PaymentProvider.PAYPAL,
                  'hover:border-gold/40 border-border-noir':
                    paymentMethod !== PaymentProvider.PAYPAL,
                }"
                @click="paymentMethod = PaymentProvider.PAYPAL"
              >
                <div class="flex items-center gap-3">
                  <RadioGroupItem
                    id="paypal"
                    :value="PaymentProvider.PAYPAL"
                  />
                  <Label
                    for="paypal"
                    class="text-text cursor-pointer"
                  >
                    PayPal
                  </Label>
                </div>
                <WalletIcon class="text-gold h-5 w-5" />
              </div>

              <!-- Moneroo -->
              <div
                class="flex cursor-pointer items-center justify-between border p-4 transition-colors"
                :class="{
                  'border-gold bg-border-noir':
                    paymentMethod === PaymentProvider.MONEROO,
                  'hover:border-gold/40 border-border-noir':
                    paymentMethod !== PaymentProvider.MONEROO,
                }"
                @click="paymentMethod = PaymentProvider.MONEROO"
              >
                <div class="flex items-center gap-3">
                  <RadioGroupItem
                    id="moneroo"
                    :value="PaymentProvider.MONEROO"
                  />
                  <Label
                    for="moneroo"
                    class="text-text cursor-pointer"
                  >
                    Mobile payment
                  </Label>
                </div>
                <GlobeIcon class="text-gold h-5 w-5" />
              </div>
            </RadioGroup>

            <p class="text-text-muted mt-4 text-xs tracking-[0.2em] uppercase">
              You will complete payment after placing your order.
            </p>
          </div>

          <!-- Place Order Button -->
          <button
            type="submit"
            :disabled="isCreatingOrder"
            class="bg-gold text-noir h-14 w-full text-xs tracking-[0.2em] uppercase transition-all hover:bg-[#B8995E] disabled:opacity-50"
          >
            {{ isCreatingOrder ? 'Processing...' : 'Place Order' }}
          </button>
        </form>
      </div>

      <!-- Right Column - Order Summary -->
      <div class="lg:col-span-2">
        <div class="border-border-noir bg-surface sticky top-24 border p-6">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="font-display text-text text-3xl font-light">
              Order summary
            </h2>
          </div>

          <!-- Cart Items -->
          <div class="space-y-4">
            <div
              v-for="item in items"
              :key="item.id"
              class="border-border-noir flex gap-4 border-b pb-4"
            >
              <RouterLink
                :to="`/products/${item.product.slug}${item.productVariant ? `?${item.productVariant.productVariantOptions.map((option: any) => `${option.option.attribute.name}=${option.option.name}`).join('&')}` : ''}`"
                class="border-border-noir bg-surface relative aspect-square w-26 shrink-0 overflow-hidden border"
              >
                <img
                  :src="item.product.images[0]"
                  :alt="item.product.name"
                  class="h-full w-full object-cover"
                />
              </RouterLink>
              <div class="flex flex-1 flex-col gap-2">
                <div>
                  <RouterLink
                    :to="`/products/${item.product.slug}${item.productVariant ? `?${item.productVariant.productVariantOptions.map((option: any) => `${option.option.attribute.name}=${option.option.name}`).join('&')}` : ''}`"
                    class="text-text"
                  >
                    {{ item.product.name }}
                  </RouterLink>
                  <p
                    v-if="item.productVariant"
                    class="text-text-muted flex flex-col text-sm"
                  >
                    <span
                      v-for="option in item.productVariant
                        .productVariantOptions"
                      :key="option.id"
                    >
                      {{ option.option.attribute.name }}:
                      {{ option.option.name }}
                    </span>
                  </p>
                </div>
                <div class="flex items-center gap-1 text-sm">
                  <span class="text-text-muted">{{ item.quantity }}</span>
                  <span class="text-text-muted text-xs">x</span>
                  <span class="text-gold">
                    {{ formatPrice(getItemPrice(item)) }}
                  </span>
                </div>
              </div>
              <div class="text-gold text-right">
                {{ formatPrice(getItemSubtotal(item)) }}
              </div>
            </div>
          </div>

          <!-- Coupon Section -->
          <div class="mt-4">
            <h3 class="text-gold mb-2 text-xs tracking-[0.3em] uppercase">
              Have a coupon?
            </h3>
            <p class="text-text-muted mb-4 text-sm">
              Add your code for an instant cart discount
            </p>

            <!-- Applied Coupon Display -->
            <div
              v-if="hasAppliedCoupon && appliedCoupon"
              class="border-gold/40 bg-border-noir mb-4 flex h-10 items-center justify-between border px-3"
            >
              <div class="flex items-center gap-2">
                <TagIcon class="text-gold h-4 w-4" />
                <span class="text-gold">
                  {{ appliedCoupon.code }}
                </span>
                <span class="text-gold/70 text-sm">
                  (-{{
                    appliedCoupon.type === 'PERCENTAGE'
                      ? `${appliedCoupon.value}%`
                      : formatPrice(appliedCoupon.discountAmount)
                  }})
                </span>
              </div>
              <button
                @click="removeCoupon"
                class="text-gold hover:text-text cursor-pointer text-xs tracking-[0.2em] uppercase"
              >
                Remove
              </button>
            </div>

            <!-- Coupon Input -->
            <div
              v-else
              class="flex w-full items-end gap-2"
            >
              <div class="relative flex-1">
                <Input
                  v-model="couponCode"
                  placeholder="Coupon Code"
                  class="focus:border-gold text-text placeholder:text-text-muted border-border-noir bg-surface h-10 w-full border pl-10 uppercase"
                  :disabled="isApplyingCoupon"
                  @keyup.enter="handleApplyCoupon"
                />
                <TagIcon
                  class="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                />
              </div>
              <button
                class="border-gold/40 text-gold hover:bg-gold hover:text-noir h-10 border px-6 text-xs tracking-[0.2em] uppercase transition-all disabled:opacity-50"
                @click="handleApplyCoupon"
                :disabled="isApplyingCoupon || !couponCode"
              >
                {{ isApplyingCoupon ? 'Applying...' : 'Apply' }}
              </button>
            </div>
          </div>

          <!-- Summary Totals -->
          <div class="border-border-noir mt-6 space-y-3 border-t pt-6">
            <div class="flex justify-between text-sm">
              <span class="text-text-muted">Subtotal</span>
              <span class="text-text">{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-text-muted">Shipping</span>
              <span class="text-text">
                {{ formatPrice(shippingCost) }}
              </span>
            </div>
            <div
              v-if="hasAppliedCoupon"
              class="text-gold flex justify-between text-sm"
            >
              <span>Discount</span>
              <span>-{{ formatPrice(discountAmount) }}</span>
            </div>
            <div class="bg-gold/40 mx-auto mt-4 h-px w-24"></div>
            <div class="flex justify-between pt-2">
              <span class="text-gold text-xs tracking-[0.3em] uppercase">
                Total
              </span>
              <span class="font-display text-gold text-2xl font-light">
                {{ formatPrice(total) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
