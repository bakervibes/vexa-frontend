<script setup lang="ts">
import { cn } from '@/utils/lib'
import { CheckIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toaster } from 'vue-sonner'

const route = useRoute()
const router = useRouter()

const currentQuery = route.query

const buildQueryString = (query: Record<string, unknown>) => {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value))
    }
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

const steps = computed(() => [
  {
    step: 1,
    title: 'Panier',
    route: `/cart${buildQueryString(currentQuery)}`,
    name: 'cart',
  },
  {
    step: 2,
    title: 'Paiement',
    route: `/checkout${buildQueryString(currentQuery)}`,
    name: 'checkout',
  },
  {
    step: 3,
    title: 'Confirmation',
    route: `/complete${buildQueryString(currentQuery)}`,
    name: 'complete',
  },
])

const currentStep = computed(() => {
  const routeName = route.name as string
  const stepIndex = steps.value.findIndex((s) => s.name === routeName)
  return stepIndex >= 0 ? stepIndex + 1 : 1
})

const pageTitle = computed(() => {
  switch (route.name) {
    case 'cart':
      return 'Panier'
    case 'checkout':
      return 'Paiement'
    case 'complete':
      return 'Confirmation'
    default:
      return 'Panier'
  }
})

const handleStepClick = (step: number) => {
  if (step < currentStep.value) {
    const targetStep = steps.value[step - 1]
    if (targetStep) {
      router.push(targetStep.route)
    }
  }
}
</script>

<template>
  <div class="bg-noir flex min-h-screen flex-col">
    <main class="flex-1">
      <div class="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div
          class="text-gold mb-6 text-center text-xs tracking-[0.3em] uppercase"
        >
          Commande
        </div>

        <h1
          class="font-display text-text text-center text-5xl font-light md:text-6xl"
        >
          {{ pageTitle }}
        </h1>

        <div class="bg-gold/40 mx-auto my-12 h-px w-24" />

        <div class="mx-auto mb-16 max-w-2xl">
          <div class="flex w-full items-start justify-between gap-2">
            <div
              v-for="(stepItem, index) in steps"
              :key="stepItem.step"
              class="group relative flex w-full flex-col items-center gap-3"
              :class="{ 'cursor-pointer': stepItem.step < currentStep }"
              @click="handleStepClick(stepItem.step)"
            >
              <div class="flex flex-col items-center gap-3">
                <div
                  :class="
                    cn(
                      'flex h-12 w-12 items-center justify-center border text-sm font-light transition-all',
                      stepItem.step < currentStep
                        ? 'border-gold bg-gold text-noir'
                        : stepItem.step === currentStep
                          ? 'border-gold/40 text-gold'
                          : 'border-border-noir text-[#555]',
                    )
                  "
                >
                  <CheckIcon
                    v-if="stepItem.step < currentStep"
                    class="h-5 w-5"
                  />
                  <span v-else>
                    {{ String(stepItem.step).padStart(2, '0') }}
                  </span>
                </div>
                <div
                  :class="
                    cn(
                      'text-xs tracking-widest uppercase',
                      stepItem.step <= currentStep
                        ? 'text-gold'
                        : 'text-[#555]',
                    )
                  "
                >
                  {{ stepItem.title }}
                </div>
              </div>

              <div
                v-if="index < steps.length - 1"
                :class="
                  cn(
                    'absolute top-6 left-[calc(50%+32px)] h-px w-[calc(100%-64px)]',
                    stepItem.step < currentStep ? 'bg-gold' : 'bg-border-noir',
                  )
                "
              />
            </div>
          </div>
        </div>

        <RouterView />
      </div>
    </main>

    <Toaster
      richColors
      position="bottom-right"
      :duration="3000"
    />
  </div>
</template>
