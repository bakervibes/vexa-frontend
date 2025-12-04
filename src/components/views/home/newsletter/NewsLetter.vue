<script setup lang="ts">
import { MailIcon } from 'lucide-vue-next'
import Button from 'primevue/button'
import { ref } from 'vue'

const email = ref('')

const handleSubmit = () => {
  if (email.value) {
    console.log('Newsletter signup:', email.value)
    // TODO: Implement newsletter signup logic
    email.value = ''
  }
}
</script>

<template>
  <section class="relative w-full overflow-hidden bg-[#f5f5f5] py-16">
    <div class="absolute top-0 bottom-0 left-0 hidden lg:block">
      <img
        src="/newsletter/left.png"
        alt=""
        class="h-full w-auto object-cover object-right"
      />
    </div>

    <div class="absolute top-0 right-0 bottom-0 hidden lg:block">
      <img
        src="/newsletter/right.png"
        alt=""
        class="h-full w-auto object-cover object-left"
      />
    </div>

    <div
      class="relative z-10 mx-auto max-w-xl px-6 text-center lg:max-w-lg xl:max-w-xl"
    >
      <h2 class="text-2xl font-bold text-black sm:text-3xl lg:text-4xl">
        Join Our Newsletter
      </h2>
      <p class="mt-3 text-sm text-gray-600 sm:text-base">
        Sign up for deals, new products and promotions
      </p>

      <!-- Email form -->
      <form
        @submit.prevent="handleSubmit"
        class="mt-8"
      >
        <div class="relative flex items-center border-b border-gray-400">
          <MailIcon class="h-5 w-5 text-gray-600" />
          <input
            v-model="email"
            type="email"
            placeholder="Email address"
            class="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
            required
          />
          <Button
            type="submit"
            text
            class="px-0 text-sm font-medium text-gray-700 hover:text-black"
          >
            Signup
          </Button>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped></style>
