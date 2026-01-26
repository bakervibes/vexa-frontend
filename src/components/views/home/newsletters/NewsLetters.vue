<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useNewsletters } from '@/composables/useNewsletters'
import {
  subscribeNewsletterSchema,
  type SubscribeNewsletterInput,
} from '@/validators/newsletters.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { MailIcon } from 'lucide-vue-next'
import { useForm } from 'vee-validate'

const { subscribe, isSubscribing } = useNewsletters()

const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(subscribeNewsletterSchema),
  initialValues: {
    email: '',
  },
})

const onSubmit = handleSubmit(async (formValues: SubscribeNewsletterInput) => {
  await subscribe(formValues)
  resetForm()
})
</script>

<template>
  <section class="relative w-full overflow-hidden bg-[#f5f5f5] py-16">
    <div class="absolute top-0 bottom-0 left-0 hidden lg:block">
      <img
        src="/newsletters/left.png"
        alt=""
        class="h-full w-auto object-cover object-right"
      />
    </div>

    <div class="absolute top-0 right-0 bottom-0 hidden lg:block">
      <img
        src="/newsletters/right.png"
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
        @submit="onSubmit"
        class="mt-8"
      >
        <FormField
          v-slot="{ componentField }"
          name="email"
        >
          <FormItem>
            <div class="relative flex items-center border-b border-gray-400">
              <MailIcon class="mr-2 h-5 w-5 text-gray-600" />
              <CustomInput
                v-bind="componentField"
                type="email"
                placeholder="Email address"
                :show-border="false"
              />
              <LoadingButton
                type="submit"
                variant="ghost"
                :loading="isSubscribing"
                :disabled="isSubscribing"
                class="ml-2 px-0 text-sm font-medium text-gray-700 hover:text-black"
              >
                Signup
              </LoadingButton>
            </div>
            <FormMessage class="mt-1 text-left" />
          </FormItem>
        </FormField>
      </form>
    </div>
  </section>
</template>

<style scoped></style>
