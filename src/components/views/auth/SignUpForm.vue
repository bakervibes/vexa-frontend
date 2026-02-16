<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import {
  registerBodySchema,
  type RegisterInput,
} from '@/validators/auth.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const { register, isRegistering, registerError } = useAuth()
const redirect = route.query.redirect as string | undefined
const acceptTerms = ref(false)

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(registerBodySchema),
  initialValues: {
    name: '',
    email: '',
    password: '',
  },
})

const onSubmit = handleSubmit(async (formValues: RegisterInput) => {
  const result = await register({
    name: formValues.name,
    email: formValues.email,
    password: formValues.password,
  })

  if (result.success) {
    toast.success('Compte créé avec succès', {
      description: 'Bienvenue sur Vexa !',
    })
    router.push(redirect || '/')
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-md space-y-8 px-6">
    <div class="text-center">
      <div class="text-gold mb-6 text-xs tracking-[0.3em] uppercase">
        Inscription
      </div>

      <h2 class="font-display text-text text-4xl font-light md:text-5xl">
        Créer votre
        <span class="italic">compte</span>
      </h2>

      <div class="bg-gold/60 mx-auto my-8 h-px w-16" />
    </div>

    <div
      v-if="registerError"
      class="border-gold/40 text-gold bg-surface border px-4 py-3 text-sm"
    >
      {{ registerError }}
    </div>

    <p class="text-center text-sm text-[#555]">
      Déjà un compte ?
      <RouterLink
        :to="redirect ? `/auth/sign-in?redirect=${redirect}` : '/auth/sign-in'"
        class="text-gold hover:text-text transition-colors"
      >
        Se connecter
      </RouterLink>
    </p>

    <form
      @submit="onSubmit"
      class="space-y-6"
    >
      <FormField
        v-slot="{ componentField }"
        name="name"
      >
        <FormItem>
          <CustomInput
            v-bind="componentField"
            label="Nom complet"
            type="text"
          />
          <FormMessage class="text-gold" />
        </FormItem>
      </FormField>

      <FormField
        v-slot="{ componentField }"
        name="email"
      >
        <FormItem>
          <CustomInput
            v-bind="componentField"
            label="Adresse email"
            type="email"
          />
          <FormMessage class="text-gold" />
        </FormItem>
      </FormField>

      <FormField
        v-slot="{ componentField }"
        name="password"
      >
        <FormItem>
          <CustomInput
            v-bind="componentField"
            label="Mot de passe"
            type="password"
          />
          <FormMessage class="text-gold" />
        </FormItem>
      </FormField>

      <div class="flex items-center">
        <label class="flex items-center gap-3">
          <Checkbox
            :checked="acceptTerms"
            @update:checked="acceptTerms = $event"
            class="data-[state=checked]:border-gold data-[state=checked]:bg-gold border-border-noir bg-transparent"
          />
          <span class="text-sm text-[#555]">
            J'accepte les
            <RouterLink
              to="/terms-of-service"
              class="text-gold hover:text-text transition-colors"
            >
              conditions
            </RouterLink>
            et la
            <RouterLink
              to="/privacy-policy"
              class="text-gold hover:text-text transition-colors"
            >
              politique de confidentialité
            </RouterLink>
          </span>
        </label>
      </div>

      <LoadingButton
        type="submit"
        :disabled="isRegistering"
        :loading="isRegistering"
        class="border-gold/40 bg-gold text-noir w-full border py-4 text-xs tracking-[0.2em] uppercase transition-all hover:bg-[#B8995E]"
      >
        Créer un compte
      </LoadingButton>
    </form>
  </div>
</template>
