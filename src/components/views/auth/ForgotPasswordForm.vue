<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import {
  forgotPasswordBodySchema,
  type ForgotPasswordInput,
} from '@/validators/auth.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { CheckCircle2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const { forgotPassword, forgotPasswordError, isForgotingPassword } = useAuth()
const isSuccess = ref(false)

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(forgotPasswordBodySchema),
  initialValues: {
    email: '',
  },
})

const onSubmit = handleSubmit(async (formValues: ForgotPasswordInput) => {
  const result = await forgotPassword(formValues.email)

  if (result.success) {
    isSuccess.value = true
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-md space-y-8 px-6">
    <div class="text-center">
      <div class="text-gold mb-6 text-xs tracking-[0.3em] uppercase">
        Récupération
      </div>

      <h2 class="font-display text-text text-4xl font-light md:text-5xl">
        Mot de passe
        <span class="italic">oublié</span>
      </h2>

      <div class="bg-gold/60 mx-auto my-8 h-px w-16" />
    </div>

    <template v-if="isSuccess">
      <div class="border-gold/40 bg-surface border p-6 text-center">
        <CheckCircle2 class="text-gold mx-auto mb-4 h-10 w-10" />
        <p class="text-text text-sm">
          Si un compte existe avec cet email, vous recevrez un lien de
          réinitialisation.
        </p>
        <div class="mt-4">
          <RouterLink
            to="/auth/sign-in"
            class="text-gold hover:text-text text-xs tracking-widest uppercase transition-colors"
          >
            Retour à la connexion
          </RouterLink>
        </div>
      </div>
    </template>

    <template v-else>
      <p class="text-center text-sm text-[#555]">
        Entrez votre adresse email pour recevoir un lien de réinitialisation.
      </p>

      <div
        v-if="forgotPasswordError"
        class="border-gold/40 text-gold bg-surface border px-4 py-3 text-sm"
      >
        {{ forgotPasswordError }}
      </div>

      <form
        @submit="onSubmit"
        class="space-y-6"
      >
        <FormField
          v-slot="{ componentField }"
          name="email"
        >
          <FormItem>
            <CustomInput
              v-bind="componentField"
              label="Adresse email"
              type="text"
            />
            <FormMessage class="text-gold" />
          </FormItem>
        </FormField>

        <div class="flex flex-col gap-4">
          <LoadingButton
            type="submit"
            :disabled="isForgotingPassword"
            :loading="isForgotingPassword"
            class="border-gold/40 bg-gold text-noir w-full border py-4 text-xs tracking-[0.2em] uppercase transition-all hover:bg-[#B8995E]"
          >
            Envoyer le lien
          </LoadingButton>

          <div class="text-center">
            <RouterLink
              to="/auth/sign-in"
              class="hover:text-gold text-xs tracking-widest text-[#555] uppercase transition-colors"
            >
              Retour à la connexion
            </RouterLink>
          </div>
        </div>
      </form>
    </template>
  </div>
</template>
