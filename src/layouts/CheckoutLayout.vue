<script setup lang="ts">
/**
 * CheckoutLayout
 * Layout for checkout flow pages (Cart, Checkout, Complete)
 * Includes a stepper header to show progress
 */
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@/components/ui/stepper'
import { cn } from '@/utils/lib'
import { CheckIcon } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toaster } from 'vue-sonner'

const route = useRoute()
const router = useRouter()

const steps = [
  { step: 1, title: 'Cart', route: '/cart', name: 'cart' },
  { step: 2, title: 'Checkout', route: '/checkout', name: 'checkout' },
  { step: 3, title: 'Completed', route: '/complete', name: 'complete' },
]

const currentStep = computed(() => {
  const routeName = route.name as string
  const stepIndex = steps.findIndex((s) => s.name === routeName)
  return stepIndex >= 0 ? stepIndex + 1 : 1
})

const pageTitle = computed(() => {
  switch (route.name) {
    case 'cart':
      return 'Cart'
    case 'checkout':
      return 'Check Out'
    case 'complete':
      return 'Complete!'
    default:
      return 'Cart'
  }
})

const handleStepClick = (step: number) => {
  // Only allow going back to previous steps, not forward
  if (step < currentStep.value) {
    const targetStep = steps[step - 1]
    if (targetStep) {
      router.push(targetStep.route)
    }
  }
}
</script>

<template>
  <div
    class="flex min-h-[calc(100vh-4rem)] flex-col sm:min-h-[calc(100vh-4.5rem)]"
  >
    <main class="flex-1">
      <div class="container mx-auto px-4 py-8 md:py-12">
        <!-- Page Title -->
        <h1
          class="mb-8 text-center font-serif text-4xl font-medium md:text-5xl"
        >
          {{ pageTitle }}
        </h1>

        <!-- Stepper Header -->
        <div class="mx-auto mb-12 max-w-2xl">
          <Stepper
            :model-value="currentStep"
            class="flex w-full items-start justify-between gap-2"
          >
            <template
              v-for="(stepItem, index) in steps"
              :key="stepItem.step"
            >
              <StepperItem
                :step="stepItem.step"
                class="group relative flex w-full flex-col items-center gap-2"
                :class="{ 'cursor-pointer': stepItem.step < currentStep }"
                @click="handleStepClick(stepItem.step)"
              >
                <StepperTrigger
                  class="flex flex-col items-center gap-2"
                  :class="{
                    'cursor-pointer':
                      stepItem.step < currentStep ||
                      stepItem.step === currentStep,
                  }"
                >
                  <StepperIndicator
                    :class="
                      cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                        stepItem.step < currentStep
                          ? 'bg-emerald-500 text-white'
                          : stepItem.step === currentStep
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-500',
                      )
                    "
                  >
                    <CheckIcon
                      v-if="stepItem.step < currentStep"
                      class="h-5 w-5"
                    />
                    <span v-else>{{ stepItem.step }}</span>
                  </StepperIndicator>
                  <StepperTitle
                    :class="
                      cn(
                        'text-sm font-medium',
                        stepItem.step <= currentStep
                          ? 'text-emerald-600'
                          : 'text-gray-500',
                      )
                    "
                  >
                    {{ stepItem.title }}
                  </StepperTitle>
                </StepperTrigger>

                <!-- Separator line -->
                <StepperSeparator
                  v-if="index < steps.length - 1"
                  :class="
                    cn(
                      'absolute top-5 left-[calc(50%+28px)] h-0.5 w-[calc(100%-56px)]',
                      stepItem.step < currentStep
                        ? 'bg-emerald-500'
                        : 'bg-gray-200',
                    )
                  "
                />
              </StepperItem>
            </template>
          </Stepper>
        </div>

        <!-- Page Content -->
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

<style scoped>
/* Checkout layout specific styles */
</style>
