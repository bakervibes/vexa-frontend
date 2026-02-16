<script lang="ts" setup>
import { useRecentDiscountProduct } from '@/composables/useProducts'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const {
  recentDiscountProduct,
  isLoadingRecentDiscountProduct,
  isErrorRecentDiscountProduct,
} = useRecentDiscountProduct()

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
  <section class="border-border-noir w-full border-y">
    <div
      v-if="isLoadingRecentDiscountProduct"
      class="flex h-140 items-center justify-center"
    >
      <div
        class="border-t-gold border-border-noir h-8 w-8 animate-spin border-2"
      />
    </div>

    <div
      v-else-if="isErrorRecentDiscountProduct"
      class="flex h-140 items-center justify-center"
    >
      <p class="text-[#555]">Aucune promotion disponible</p>
    </div>

    <div
      v-else-if="recentDiscountProduct"
      class="flex flex-col md:flex-row"
    >
      <div class="relative h-72 w-full md:h-140 md:flex-1">
        <img
          :src="recentDiscountProduct.images[0]"
          :alt="recentDiscountProduct.name"
          class="absolute inset-0 h-full w-full object-cover opacity-80"
        />
      </div>

      <div
        class="bg-surface flex flex-col justify-center p-8 md:flex-1 md:p-12 lg:p-16"
      >
        <div class="mb-4">
          <span class="text-gold text-xs tracking-[0.3em] uppercase">
            Offre limitée
          </span>
        </div>

        <h2
          class="font-display text-text mb-4 text-4xl font-light md:text-5xl lg:text-6xl"
        >
          {{ discountPercentage }}% de réduction
        </h2>

        <p class="mb-8 text-sm leading-relaxed text-[#555] md:text-base">
          {{
            recentDiscountProduct.description ||
            'Profitez de cette offre exceptionnelle sur une sélection de produits.'
          }}
        </p>

        <div class="mb-8">
          <p class="mb-4 text-xs tracking-widest text-[#555] uppercase">
            Expire dans :
          </p>
          <div class="flex items-center gap-3">
            <div class="flex flex-col items-center">
              <div
                class="text-gold border-border-noir flex h-14 w-14 items-center justify-center border text-2xl font-light md:h-16 md:w-16 md:text-3xl"
              >
                {{ String(timeLeft.days).padStart(2, '0') }}
              </div>
              <span
                class="mt-2 text-[10px] tracking-widest text-[#555] uppercase"
              >
                Jours
              </span>
            </div>

            <span class="text-gold mb-7 text-xl">:</span>

            <div class="flex flex-col items-center">
              <div
                class="text-gold border-border-noir flex h-14 w-14 items-center justify-center border text-2xl font-light md:h-16 md:w-16 md:text-3xl"
              >
                {{ String(timeLeft.hours).padStart(2, '0') }}
              </div>
              <span
                class="mt-2 text-[10px] tracking-widest text-[#555] uppercase"
              >
                Heures
              </span>
            </div>

            <span class="text-gold mb-7 text-xl">:</span>

            <div class="flex flex-col items-center">
              <div
                class="text-gold border-border-noir flex h-14 w-14 items-center justify-center border text-2xl font-light md:h-16 md:w-16 md:text-3xl"
              >
                {{ String(timeLeft.minutes).padStart(2, '0') }}
              </div>
              <span
                class="mt-2 text-[10px] tracking-widest text-[#555] uppercase"
              >
                Min
              </span>
            </div>

            <span class="text-gold mb-7 text-xl">:</span>

            <div class="flex flex-col items-center">
              <div
                class="text-gold border-border-noir flex h-14 w-14 items-center justify-center border text-2xl font-light md:h-16 md:w-16 md:text-3xl"
              >
                {{ String(timeLeft.seconds).padStart(2, '0') }}
              </div>
              <span
                class="mt-2 text-[10px] tracking-widest text-[#555] uppercase"
              >
                Sec
              </span>
            </div>
          </div>
        </div>

        <router-link
          :to="`/products/${recentDiscountProduct.slug}`"
          class="border-gold/40 text-gold hover:bg-gold hover:text-noir inline-block w-fit border px-8 py-3.5 text-xs tracking-[0.2em] uppercase transition-all"
        >
          Voir l'offre
        </router-link>
      </div>
    </div>
  </section>
</template>
