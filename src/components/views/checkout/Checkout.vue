<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import CustomSelect from '@/components/custom/custom-select.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { useUserAddresses } from '@/composables/useAddresses'
import { useAuthModal } from '@/composables/useAuthModal'
import { useCarts } from '@/composables/useCarts'
import { useCoupons } from '@/composables/useCoupons'
import { useOrdersMutation } from '@/composables/useOrders'
import { useAuthStore } from '@/stores/auth'
import { PaymentProvider, type Address } from '@/types'
import { getAllCountries } from '@/utils/countries'
import { formatPrice } from '@/utils/lib'
import {
  createOrderSchema,
  type CreateOrderInput,
} from '@/validators/orders.validator'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import {
  CreditCardIcon,
  MapPinIcon,
  PlusIcon,
  ShoppingCartIcon,
  TagIcon,
  TruckIcon,
} from 'lucide-vue-next'
import Button from 'primevue/button'
import Message from 'primevue/message'
import RadioButton from 'primevue/radiobutton'
import Skeleton from 'primevue/skeleton'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { openAuthModal } = useAuthModal()
const { subtotal, items, isLoadingCart, isEmpty } = useCarts()
const { createOrder, isCreatingOrder } = useOrdersMutation()
const {
  addresses,
  defaultAddress,
  isLoading: isLoadingAddresses,
} = useUserAddresses()

// Initialize coupon composable with cart subtotal
const {
  couponCode,
  appliedCoupon,
  discountAmount,
  hasAppliedCoupon,
  isApplyingCoupon,
  applyCoupon,
  removeCoupon,
} = useCoupons(() => subtotal.value)

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
const cardDetails = ref({
  number: '',
  expiry: '',
  cvc: '',
})
const formKey = ref(0)

// Initial form values
const initialValues = ref({
  address: {
    id: undefined as string | undefined,
    country: '',
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
  },
  payment: {
    provider: PaymentProvider.STRIPE,
    transactionId: '1234567890',
    metadata: {},
  },
  coupon: null as string | null,
  shippingOption: {
    id: shippingOptions[0]!.id,
    label: shippingOptions[0]!.label,
    price: shippingOptions[0]!.price,
    isPercentage: shippingOptions[0]!.isPercentage ?? false,
  },
})

const resolver = zodResolver(createOrderSchema)

// Initialize from URL on mount
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
  () => subtotal.value - discountAmount.value + shippingCost.value,
)

// Helper functions for item prices
const getItemPrice = (item: (typeof items.value)[0]) => {
  return (
    item.variant?.price ??
    item.variant?.basePrice ??
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
  initialValues.value.shippingOption = {
    id: option.id,
    label: option.label,
    price: option.price,
    isPercentage: option.isPercentage ?? false,
  }
  formKey.value++
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
    initialValues.value.address = {
      id: undefined,
      name: '',
      email: '',
      street: '',
      city: '',
      country: '',
      phone: '',
    }
    selectedAddressId.value = null
    formKey.value++
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
  initialValues.value.payment.provider = newMethod
  formKey.value++
})

// Watch for applied coupon changes and update form
watch(
  () => appliedCoupon.value,
  (newCoupon) => {
    if (newCoupon) {
      initialValues.value.coupon = newCoupon.code
    } else {
      initialValues.value.coupon = null
    }
    formKey.value++
  },
)

// Fill form with address data
function fillFormWithAddress(address: Address) {
  initialValues.value.address = {
    id: address.id,
    name: address.name,
    email: address.email,
    street: address.street,
    city: address.city,
    country: address.country,
    phone: address.phone,
  }
  formKey.value++
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

const handleRemoveCoupon = () => {
  removeCoupon()
}

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) return

  if (!authStore.isAuthenticated) {
    openAuthModal('login', () => {
      proceedWithOrder(values as CreateOrderInput)
    })
    return
  }

  proceedWithOrder(values as CreateOrderInput)
}

const proceedWithOrder = async (values: CreateOrderInput) => {
  try {
    const order = await createOrder(values)
    router.push({
      name: 'complete',
      query: {
        orderNumber: order.orderNumber,
      },
    })
  } catch (error) {
    console.error('Error placing order:', error)
  }
}
</script>

<template>
  <!-- Loading State -->
  <div
    v-if="isLoadingCart"
    class="flex flex-col gap-4 py-8"
  >
    <div
      v-for="i in 3"
      :key="i"
      class="flex items-center gap-4"
    >
      <Skeleton class="h-24 w-24 rounded-md" />
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

  <!-- Empty Cart State -->
  <div
    v-else-if="isEmpty"
    class="flex flex-col items-center justify-center gap-4 py-16 text-center"
  >
    <div class="rounded-full bg-gray-100 p-6">
      <ShoppingCartIcon class="h-10 w-10 text-gray-400" />
    </div>
    <div class="space-y-1">
      <h3 class="text-lg font-semibold">Your cart is empty</h3>
      <p class="text-sm text-gray-500">Add products to start shopping</p>
    </div>
    <RouterLink to="/shop">
      <Button
        variant="outline"
        class="mt-4"
      >
        Continue shopping
      </Button>
    </RouterLink>
  </div>

  <div
    v-else
    class="grid gap-8 lg:grid-cols-3"
  >
    <!-- Left Column - Forms -->
    <div class="space-y-6 lg:col-span-2">
      <Form
        v-slot="$form"
        :key="formKey"
        :initialValues="initialValues"
        :resolver="resolver"
        @submit="onFormSubmit"
      >
        <!-- Contact Information -->
        <div class="mb-6 rounded border p-6">
          <h2 class="mb-6 text-xl font-semibold">Contact Information</h2>

          <div class="space-y-4">
            <div class="flex flex-col gap-1">
              <CustomInput
                name="address.name"
                label="Full Name *"
                type="text"
              />
              <Message
                v-if="$form['address.name']?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form['address.name'].error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <CustomInput
                name="address.email"
                label="Email Address *"
                type="email"
              />
              <Message
                v-if="$form['address.email']?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form['address.email'].error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <CustomPhoneInput
                name="address.phone"
                label="Phone Number *"
              />
              <Message
                v-if="$form['address.phone']?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form['address.phone'].error?.message }}
              </Message>
            </div>
          </div>
        </div>

        <!-- Address Section -->
        <div class="mb-6 rounded border p-6">
          <h2 class="mb-6 text-xl font-semibold">Delivery Address</h2>

          <!-- Address Selection -->
          <div
            v-if="authStore.isAuthenticated && addresses.length > 0"
            class="mb-6"
          >
            <div class="mb-4 flex gap-4">
              <Button
                type="button"
                :variant="addressMode === 'existing' ? 'default' : 'outline'"
                @click="addressMode = 'existing'"
                class="flex items-center gap-2"
              >
                <MapPinIcon class="h-4 w-4" />
                Use Saved Address
              </Button>
              <Button
                type="button"
                :variant="addressMode === 'new' ? 'default' : 'outline'"
                @click="addressMode = 'new'"
                class="flex items-center gap-2"
              >
                <PlusIcon class="h-4 w-4" />
                New Address
              </Button>
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
                class="flex cursor-pointer items-start gap-3 rounded border p-4 transition-colors"
                :class="{
                  'border-black bg-gray-50': selectedAddressId === address.id,
                  'hover:border-gray-400': selectedAddressId !== address.id,
                }"
              >
                <div
                  class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2"
                  :class="{
                    'border-black': selectedAddressId === address.id,
                    'border-gray-300': selectedAddressId !== address.id,
                  }"
                >
                  <div
                    v-if="selectedAddressId === address.id"
                    class="h-2.5 w-2.5 rounded-full bg-black"
                  />
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ address.name }}</span>
                    <span
                      v-if="address.isDefault"
                      class="rounded bg-gray-200 px-2 py-0.5 text-xs"
                    >
                      Default
                    </span>
                  </div>
                  <p class="text-sm text-gray-600">{{ address.country }}</p>
                  <p
                    v-if="address.phone"
                    class="mt-1 text-sm text-gray-500"
                  >
                    {{ address.phone }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Info about modifying address -->
            <p
              v-if="addressMode === 'existing' && selectedAddressId"
              class="mb-4 text-sm text-gray-500"
            >
              You can modify the fields below. If you make changes, the address
              will be updated.
            </p>
          </div>

          <!-- Address Form Fields -->
          <div class="space-y-4">
            <div class="flex flex-col gap-1">
              <CustomInput
                name="address.street"
                label="Street Address *"
                type="text"
              />
              <Message
                v-if="$form['address.street']?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form['address.street'].error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <CustomSelect
                name="address.country"
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
              <Message
                v-if="$form['address.country']?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form['address.country'].error?.message }}
              </Message>
            </div>

            <div class="flex flex-col gap-1">
              <CustomInput
                name="address.city"
                label="Town / City *"
                type="text"
              />
              <Message
                v-if="$form['address.city']?.invalid"
                severity="error"
                size="small"
                variant="simple"
              >
                {{ $form['address.city'].error?.message }}
              </Message>
            </div>
          </div>
        </div>

        <!-- Shipping Method -->
        <div class="mb-6 rounded border p-6">
          <h2 class="mb-6 flex items-center gap-2 text-xl font-semibold">
            <TruckIcon class="h-5 w-5" />
            Shipping Method
          </h2>

          <div class="space-y-3">
            <div
              v-for="option in shippingOptions"
              :key="option.id"
              class="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors"
              :class="{
                'border-black bg-gray-50': selectedShippingId === option.id,
                'hover:border-gray-300': selectedShippingId !== option.id,
              }"
              @click="changeShippingOption(option.id)"
            >
              <div class="flex items-center gap-3">
                <RadioButton
                  :inputId="option.id"
                  name="shipping"
                  :value="option.id"
                  :modelValue="selectedShippingId"
                  @update:modelValue="changeShippingOption"
                />
                <label
                  :for="option.id"
                  class="cursor-pointer font-normal"
                >
                  {{ option.label }}
                </label>
              </div>
              <span class="text-sm font-medium">
                {{
                  option.price === 0
                    ? formatPrice(0)
                    : option.isPercentage
                      ? `${option.price}%`
                      : formatPrice(option.price)
                }}
              </span>
            </div>
          </div>

          <p class="mt-3 text-xs text-gray-500">
            Note: Shipping cost is not affected by coupon discounts.
          </p>
        </div>

        <!-- Payment Method -->
        <div class="mb-6 rounded border p-6">
          <h2 class="mb-6 text-xl font-semibold">Payment method</h2>

          <div class="space-y-3">
            <div
              class="flex cursor-pointer items-center justify-between rounded border p-4 transition-colors"
              :class="{
                'border-black bg-gray-50':
                  paymentMethod === PaymentProvider.STRIPE,
                'hover:border-gray-300':
                  paymentMethod !== PaymentProvider.STRIPE,
              }"
              @click="paymentMethod = PaymentProvider.STRIPE"
            >
              <div class="flex items-center gap-3">
                <RadioButton
                  :inputId="'stripe'"
                  name="payment"
                  :value="PaymentProvider.STRIPE"
                  v-model="paymentMethod"
                />
                <label
                  for="stripe"
                  class="cursor-pointer font-normal"
                >
                  Pay by Card Credit
                </label>
              </div>
              <CreditCardIcon class="h-5 w-5 text-gray-400" />
            </div>

            <div
              class="flex cursor-pointer items-center justify-between rounded border p-4 transition-colors"
              :class="{
                'border-black bg-gray-50':
                  paymentMethod === PaymentProvider.PAYPAL,
                'hover:border-gray-300':
                  paymentMethod !== PaymentProvider.PAYPAL,
              }"
              @click="paymentMethod = PaymentProvider.PAYPAL"
            >
              <div class="flex items-center gap-3">
                <RadioButton
                  :inputId="'paypal'"
                  name="payment"
                  :value="PaymentProvider.PAYPAL"
                  v-model="paymentMethod"
                />
                <label
                  for="paypal"
                  class="cursor-pointer font-normal"
                >
                  Paypal
                </label>
              </div>
            </div>
          </div>

          <!-- Card Details (shown when Stripe is selected) -->
          <div
            v-if="paymentMethod === PaymentProvider.STRIPE"
            class="mt-6 space-y-4 border-t pt-6"
          >
            <CustomInput
              id="cardNumber"
              label="Card Number"
              v-model="cardDetails.number"
            />

            <div class="grid gap-4 sm:grid-cols-2">
              <CustomInput
                id="expiry"
                label="Expiration Date (MM/YY)"
                v-model="cardDetails.expiry"
              />
              <CustomInput
                id="cvc"
                label="CVC"
                v-model="cardDetails.cvc"
              />
            </div>
          </div>
        </div>

        <!-- Place Order Button -->
        <LoadingButton
          type="submit"
          :loading="isCreatingOrder"
          :disabled="isCreatingOrder"
          class="h-14 w-full text-base"
        >
          Place Order
        </LoadingButton>
      </Form>
    </div>

    <!-- Right Column - Order Summary -->
    <div class="lg:col-span-1">
      <div class="sticky top-4 rounded border p-6">
        <h2 class="mb-6 text-xl font-semibold">Order summary</h2>

        <!-- Cart Items -->
        <div class="space-y-4">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex gap-4 border-b pb-4"
          >
            <div
              class="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100"
            >
              <img
                :src="item.product.images[0]"
                :alt="item.product.name"
                class="h-full w-full object-cover"
              />
            </div>
            <div class="flex flex-1 flex-col justify-between gap-2">
              <div>
                <h4 class="font-medium">{{ item.product.name }}</h4>
                <p
                  v-if="item.variant"
                  class="flex flex-col text-sm text-gray-500"
                >
                  <span
                    v-for="option in item.variant.productVariantOptions"
                    :key="option.id"
                  >
                    {{ option.option.attribute.name }}:
                    {{ option.option.name }}
                  </span>
                </p>
              </div>
              <div
                class="flex h-7 w-16 items-center justify-center rounded border px-3 text-center text-sm"
              >
                {{ item.quantity }}
              </div>
            </div>
            <div class="text-right font-medium">
              {{ formatPrice(getItemSubtotal(item)) }}
            </div>
          </div>
        </div>

        <!-- Coupon Section -->
        <div class="mt-4">
          <h3 class="mb-2 text-lg font-semibold">Have a coupon?</h3>
          <p class="mb-4 text-sm text-gray-500">
            Add your code for an instant cart discount
          </p>

          <!-- Applied Coupon Display -->
          <div
            v-if="hasAppliedCoupon && appliedCoupon"
            class="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3"
          >
            <div class="flex items-center gap-2">
              <TagIcon class="h-4 w-4 text-emerald-600" />
              <span class="font-medium text-emerald-700">
                {{ appliedCoupon.code }}
              </span>
              <span class="text-sm text-emerald-600">
                (-{{
                  appliedCoupon.type === 'PERCENTAGE'
                    ? `${appliedCoupon.value}%`
                    : formatPrice(appliedCoupon.discountAmount)
                }})
              </span>
            </div>
            <button
              @click="handleRemoveCoupon"
              class="text-sm text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>

          <!-- Coupon Input -->
          <div
            v-else
            class="flex max-w-md items-end gap-2"
          >
            <div class="flex-1">
              <CustomInput
                v-model="couponCode"
                label="Coupon Code"
                :disabled="isApplyingCoupon"
                @keyup.enter="handleApplyCoupon"
              />
            </div>
            <Button
              type="button"
              class="h-10 px-6"
              @click="handleApplyCoupon"
              :disabled="isApplyingCoupon || !couponCode.trim()"
            >
              {{ isApplyingCoupon ? 'Applying...' : 'Apply' }}
            </Button>
          </div>
        </div>

        <!-- Totals -->
        <div class="mt-6 space-y-3 border-t pt-6">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Subtotal</span>
            <span>{{ formatPrice(subtotal) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">
              Shipping ({{ selectedShippingOption.label }})
            </span>
            <span>
              {{ shippingCost === 0 ? 'Free' : formatPrice(shippingCost) }}
            </span>
          </div>
          <div
            v-if="hasAppliedCoupon && discountAmount > 0"
            class="flex justify-between text-sm text-emerald-600"
          >
            <span>Discount</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{{ formatPrice(total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
