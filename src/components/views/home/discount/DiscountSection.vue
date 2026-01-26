<script lang="ts" setup>
import { useRecentDiscountProduct } from '@/composables/useProducts'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const {
  recentDiscountProduct,
  isLoadingRecentDiscountProduct,
  isErrorRecentDiscountProduct,
} = useRecentDiscountProduct()

// Countdown timer
const timeLeft = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
})

let intervalId: number | null = null

const calculateTimeLeft = () => {
  if (!recentDiscountProduct.value?.expiresAt) {
    return
  }

  const expiresAt = new Date(recentDiscountProduct.value.expiresAt).getTime()
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
    timeLeft.value = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }
}

const discountPercentage = computed(() => {
  const base = recentDiscountProduct.value?.basePrice
  const current = recentDiscountProduct.value?.price

  if (base && current) {
    return Math.round(((base - current) / base) * 100)
  }

  return 0
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
  <section class="w-full">
    <!-- Loading -->
    <div
      v-if="isLoadingRecentDiscountProduct"
      class="flex h-200 flex-col-reverse overflow-hidden md:h-125 md:flex-row"
    >
      <div
        class="h-1/2 w-full animate-pulse bg-gray-200 md:h-full md:w-1/2"
      ></div>
      <div
        class="h-1/2 w-full animate-pulse bg-gray-100 md:h-full md:w-1/2"
      ></div>
    </div>

    <!-- Error -->
    <div
      v-else-if="isErrorRecentDiscountProduct"
      class="flex h-100 items-center justify-center bg-gray-100 md:h-125"
    >
      <p class="text-gray-500">No promotions available at the moment</p>
    </div>

    <!-- Content -->
    <div
      v-else-if="recentDiscountProduct"
      class="flex flex-col-reverse overflow-hidden bg-[#FFAB00]/40 md:flex-row"
    >
      <!-- Image -->
      <div class="relative h-72 w-full md:h-auto md:flex-1">
        <img
          :src="recentDiscountProduct.images[0]"
          :alt="recentDiscountProduct.name"
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div
          class="absolute inset-0 bg-linear-to-t from-black/20 to-transparent md:bg-linear-to-r"
        ></div>
      </div>

      <!-- Content -->
      <div class="flex flex-col justify-center p-8 md:flex-1 md:p-12 lg:p-16">
        <div class="mb-4">
          <span
            class="inline-block py-1 text-sm font-semibold tracking-wider text-blue-600 uppercase"
          >
            Promotion
          </span>
        </div>

        <h2
          class="mb-4 text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl"
        >
          Hurry up! {{ discountPercentage }}% OFF
        </h2>

        <p class="mb-6 text-base text-gray-700 md:text-lg">
          {{
            recentDiscountProduct.description ||
            'Thousands of high tech are waiting for you'
          }}
        </p>

        <div class="mb-8">
          <p class="mb-3 text-sm font-medium text-gray-600">
            Offer expires in:
          </p>
          <div class="flex items-center gap-3">
            <div class="flex flex-col items-center">
              <div
                class="flex h-16 w-16 items-center justify-center bg-white text-2xl font-bold text-gray-900 md:h-20 md:w-20 md:text-3xl"
              >
                {{ String(timeLeft.days).padStart(2, '0') }}
              </div>
              <span class="mt-2 text-xs font-medium text-gray-600">Days</span>
            </div>

            <span class="mb-6 text-xl font-medium text-gray-600">:</span>

            <div class="flex flex-col items-center">
              <div
                class="flex h-16 w-16 items-center justify-center bg-white text-2xl font-bold text-gray-900 md:h-20 md:w-20 md:text-3xl"
              >
                {{ String(timeLeft.hours).padStart(2, '0') }}
              </div>
              <span class="mt-2 text-xs font-medium text-gray-600">Hours</span>
            </div>

            <span class="mb-6 text-xl font-medium text-gray-600">:</span>

            <div class="flex flex-col items-center">
              <div
                class="flex h-16 w-16 items-center justify-center bg-white text-2xl font-bold text-gray-900 md:h-20 md:w-20 md:text-3xl"
              >
                {{ String(timeLeft.minutes).padStart(2, '0') }}
              </div>
              <span class="mt-2 text-xs font-medium text-gray-600">
                Minutes
              </span>
            </div>

            <span class="mb-6 text-xl font-medium text-gray-600">:</span>

            <div class="flex flex-col items-center">
              <div
                class="flex h-16 w-16 items-center justify-center bg-white text-2xl font-bold text-gray-900 md:h-20 md:w-20 md:text-3xl"
              >
                {{ String(timeLeft.seconds).padStart(2, '0') }}
              </div>
              <span class="mt-2 text-xs font-medium text-gray-600">
                Seconds
              </span>
            </div>
          </div>
        </div>

        <router-link
          :to="`/products/${recentDiscountProduct.slug}`"
          class="inline-block w-fit rounded-lg bg-gray-900 px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg"
        >
          Shop now
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
