<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import { loginBodySchema, type LoginInput } from '@/validators/auth.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const { login, error, isAdmin, isLogingIn } = useAuth()
const redirect = route.query.redirect as string | undefined
const rememberMe = ref(false)

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(loginBodySchema),
  initialValues: {
    email: '',
    password: '',
  },
})

const onSubmit = handleSubmit(async (formValues: LoginInput) => {
  const result = await login({
    email: formValues.email,
    password: formValues.password,
  })

  if (result.success) {
    toast.success('Connexion réussie', {
      description: 'Bienvenue !',
    })
    if (redirect) {
      router.push(redirect)
    } else if (isAdmin.value) {
      router.push('/admin/dashboard')
    } else {
      router.push('/')
    }
  }
})
</script>

<template>
  <div class="mx-auto w-full max-w-md space-y-8 px-6">
    <div class="text-center">
      <div class="text-gold mb-6 text-xs tracking-[0.3em] uppercase">
        Connexion
      </div>

      <h2 class="font-display text-text text-4xl font-light md:text-5xl">
        Bon retour
        <span class="italic">parmi nous</span>
      </h2>

      <div class="bg-gold/60 mx-auto my-8 h-px w-16" />
    </div>

    <div
      v-if="error"
      class="border-gold/40 text-gold bg-surface border px-4 py-3 text-sm"
    >
      {{ error }}
    </div>

    <p class="text-center text-sm text-[#555]">
      Pas encore de compte ?
      <RouterLink
        :to="redirect ? `/auth/sign-up?redirect=${redirect}` : '/auth/sign-up'"
        class="text-gold hover:text-text transition-colors"
      >
        Créer un compte
      </RouterLink>
    </p>

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

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-3">
          <Checkbox
            :checked="rememberMe"
            @update:checked="rememberMe = $event"
            class="data-[state=checked]:border-gold data-[state=checked]:bg-gold border-border-noir bg-transparent"
          />
          <span class="text-sm text-[#555]">Se souvenir de moi</span>
        </label>

        <RouterLink
          :to="'/auth/forgot-password'"
          class="text-gold hover:text-text text-xs tracking-widest uppercase transition-colors"
        >
          Mot de passe oublié ?
        </RouterLink>
      </div>

      <LoadingButton
        type="submit"
        :disabled="isLogingIn"
        :loading="isLogingIn"
        class="border-gold/40 bg-gold text-noir w-full border py-4 text-xs tracking-[0.2em] uppercase transition-all hover:bg-[#B8995E]"
      >
        Se connecter
      </LoadingButton>
    </form>
  </div>
</template>
