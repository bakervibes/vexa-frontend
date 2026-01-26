<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  <div class="grid h-screen w-full grid-cols-1 md:grid-cols-2">
    <!-- SECTION IMAGE -->
    <div class="hidden h-full w-full overflow-hidden md:block">
      <img
        src="/auth.png"
        alt="Sign in"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- SECTION FORMULAIRE -->
    <div class="flex h-full w-full items-center justify-center p-4 md:p-6">
      <div class="w-full max-w-md space-y-4">
        <h2 class="text-3xl font-bold">Sign in</h2>

        <!-- Error Message -->
        <Alert
          v-if="error"
          variant="destructive"
        >
          <AlertDescription>
            {{ error }}
          </AlertDescription>
        </Alert>

        <p class="mt-2 text-gray-600">
          Don't have an account?
          <RouterLink
            :to="
              redirect ? `/auth/sign-up?redirect=${redirect}` : '/auth/sign-up'
            "
            class="text-blue-600 hover:underline"
          >
            Create an account
          </RouterLink>
        </p>

        <form
          @submit="onSubmit"
          class="space-y-4"
        >
          <!-- Email Field -->
          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <CustomInput
                v-bind="componentField"
                label="Email address"
                type="text"
              />
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Password Field -->
          <FormField
            v-slot="{ componentField }"
            name="password"
          >
            <FormItem>
              <CustomInput
                v-bind="componentField"
                label="Password"
                type="password"
              />
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Options -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <Checkbox
                :checked="rememberMe"
                @update:checked="rememberMe = $event"
              />
              <span class="text-gray-600">Remember me</span>
            </label>

            <RouterLink
              :to="'/auth/forgot-password'"
              class="text-blue-600 hover:underline"
            >
              Forgot password?
            </RouterLink>
          </div>

          <!-- Submit Button -->
          <LoadingButton
            type="submit"
            :disabled="isLogingIn"
            :loading="isLogingIn"
            class="h-12 w-full"
          >
            Sign in
          </LoadingButton>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
