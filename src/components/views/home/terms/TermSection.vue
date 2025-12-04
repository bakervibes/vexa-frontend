<script lang="ts" setup>
import { BanknoteIcon, LockIcon, PhoneIcon, TruckIcon } from 'lucide-vue-next'
</script>

<template>
  <section
    class="mx-auto grid w-full max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:gap-4 sm:py-8 md:grid-cols-4 lg:gap-6 lg:py-10"
  >
    <div class="flex flex-col gap-1.5 bg-gray-50 p-4 sm:p-5 lg:p-6">
      <TruckIcon class="size-12 stroke-1 sm:size-14 lg:size-16" />
      <span class="text-sm font-bold sm:text-base lg:text-lg">
        Free shipping
      </span>
      <span class="text-xs text-black/60 sm:text-sm lg:text-base">
        For all orders over $100
      </span>
    </div>

    <div class="flex flex-col gap-1.5 bg-gray-50 p-4 sm:p-5 lg:p-6">
      <BanknoteIcon class="size-12 stroke-1 sm:size-14 lg:size-16" />
      <span class="text-sm font-bold sm:text-base lg:text-lg">
        Money back guarantee
      </span>
      <span class="text-xs text-black/60 sm:text-sm lg:text-base">
        30 days warranty
      </span>
    </div>

    <div class="flex flex-col gap-1.5 bg-gray-50 p-4 sm:p-5 lg:p-6">
      <LockIcon class="size-12 stroke-1 sm:size-14 lg:size-16" />
      <span class="text-sm font-bold sm:text-base lg:text-lg">
        Secure payment
      </span>
      <span class="text-xs text-black/60 sm:text-sm lg:text-base">
        Secured by Moonero
      </span>
    </div>

    <div class="flex flex-col gap-1.5 bg-gray-50 p-4 sm:p-5 lg:p-6">
      <PhoneIcon class="size-12 stroke-1 sm:size-14 lg:size-16" />
      <span class="text-sm font-bold sm:text-base lg:text-lg">
        24/7 Support
      </span>
      <span class="text-xs text-black/60 sm:text-sm lg:text-base">
        Phone and email support
      </span>
    </div>
  </section>
</template>

<style scoped></style>
