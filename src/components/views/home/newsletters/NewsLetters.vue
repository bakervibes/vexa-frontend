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
  <section class="bg-noir border-border-noir border-t px-6 py-24">
    <div class="mx-auto max-w-xl text-center">
      <div class="text-gold mb-6 text-xs tracking-[0.3em] uppercase">
        Newsletter
      </div>

      <h2 class="font-display text-text mb-4 text-4xl font-light md:text-5xl">
        Restez
        <span class="italic">informé</span>
      </h2>

      <div class="bg-gold/40 mx-auto my-8 h-px w-24" />

      <p class="mb-8 text-sm text-[#555] md:text-base">
        Inscrivez-vous pour recevoir nos offres exclusives et nouveautés en
        avant-première.
      </p>

      <form
        @submit="onSubmit"
        class="mx-auto max-w-md"
      >
        <FormField
          v-slot="{ componentField }"
          name="email"
        >
          <FormItem>
            <div
              class="focus-within:border-gold/40 border-border-noir relative flex items-center border-b"
            >
              <MailIcon class="mr-3 h-5 w-5 text-[#555]" />
              <CustomInput
                v-bind="componentField"
                type="email"
                placeholder="Votre adresse email"
                :show-border="false"
                class="text-text bg-transparent placeholder:text-[#555]"
              />
              <LoadingButton
                type="submit"
                variant="ghost"
                :loading="isSubscribing"
                :disabled="isSubscribing"
                class="text-gold hover:text-text ml-2 px-0 text-xs tracking-widest uppercase"
              >
                S'inscrire
              </LoadingButton>
            </div>
            <FormMessage class="text-gold mt-2 text-left" />
          </FormItem>
        </FormField>
      </form>
    </div>
  </section>
</template>
