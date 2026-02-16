<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import {
  resetPasswordBodySchema,
  type ResetPasswordInput,
} from '@/validators/auth.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { CheckCircle2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { resetPassword, resetPasswordError, isResettingPassword } = useAuth()
const isSuccess = ref(false)
const token = ref<string>('')

onMounted(() => {
  const queryToken = route.query.token as string
  if (!queryToken) {
    router.replace('/auth/sign-in')
    return
  }
  token.value = queryToken
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(resetPasswordBodySchema),
  initialValues: {
    password: '',
    confirmPassword: '',
  },
})

const onSubmit = handleSubmit(async (formValues: ResetPasswordInput) => {
  if (!token.value) return

  const result = await resetPassword(formValues.password)

  if (result.success) {
    isSuccess.value = true
    setTimeout(() => {
      router.push('/auth/sign-in')
    }, 3000)
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-md space-y-8 px-6">
    <div class="text-center">
      <div class="text-gold mb-6 text-xs tracking-[0.3em] uppercase">
        Réinitialisation
      </div>

      <h2 class="font-display text-text text-4xl font-light md:text-5xl">
        Nouveau mot de
        <span class="italic">passe</span>
      </h2>

      <div class="bg-gold/60 mx-auto my-8 h-px w-16" />
    </div>

    <template v-if="isSuccess">
      <div class="border-gold/40 bg-surface border p-6 text-center">
        <CheckCircle2 class="text-gold mx-auto mb-4 h-10 w-10" />
        <p class="text-text text-sm">
          Votre mot de passe a été réinitialisé avec succès.
        </p>
        <div class="mt-4">
          <RouterLink
            to="/auth/sign-in"
            class="text-gold hover:text-text text-xs tracking-widest uppercase transition-colors"
          >
            Se connecter
          </RouterLink>
        </div>
      </div>
    </template>

    <template v-else>
      <p class="text-center text-sm text-[#555]">
        Entrez votre nouveau mot de passe ci-dessous.
      </p>

      <div
        v-if="resetPasswordError"
        class="border-gold/40 text-gold bg-surface border px-4 py-3 text-sm"
      >
        {{ resetPasswordError }}
      </div>

      <form
        @submit="onSubmit"
        class="space-y-6"
      >
        <FormField
          v-slot="{ componentField }"
          name="password"
        >
          <FormItem>
            <CustomInput
              v-bind="componentField"
              label="Nouveau mot de passe"
              type="password"
            />
            <FormMessage class="text-gold" />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="confirmPassword"
        >
          <FormItem>
            <CustomInput
              v-bind="componentField"
              label="Confirmer le mot de passe"
              type="password"
            />
            <FormMessage class="text-gold" />
          </FormItem>
        </FormField>

        <div class="flex flex-col gap-4">
          <LoadingButton
            type="submit"
            :disabled="isResettingPassword"
            :loading="isResettingPassword"
            class="border-gold/40 bg-gold text-noir w-full border py-4 text-xs tracking-[0.2em] uppercase transition-all hover:bg-[#B8995E]"
          >
            Réinitialiser
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
