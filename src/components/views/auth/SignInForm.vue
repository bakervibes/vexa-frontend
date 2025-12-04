<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { useAuthStore } from '@/stores/auth'
import { loginBodySchema } from '@/validators/auth.validator'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { Form } from '@primevue/forms'
import Message from 'primevue/message'
import Checkbox from 'primevue/checkbox'
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const redirect = route.query.redirect as string | undefined
const rememberMe = ref(false)

const initialValues = {
  email: '',
  password: '',
}

const resolver = zodResolver(loginBodySchema)

// Réinitialiser l'erreur quand le formulaire change
watch(
  () => authStore.error,
  () => {},
)

const onFormSubmit = async ({
  valid,
  values,
}: {
  valid: boolean
  values: typeof initialValues
}) => {
  if (!valid) return

  // Réinitialiser l'erreur
  authStore.error = null

  const result = await authStore.login({
    email: values.email,
    password: values.password,
  })

  if (result.success) {
    if (authStore.isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push(redirect || '/')
    }
  }
}
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
        <Message
          v-if="authStore.error"
          severity="error"
          :closable="false"
        >
          {{ authStore.error }}
        </Message>

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

        <Form
          v-slot="$form"
          :initialValues="initialValues"
          :resolver="resolver"
          @submit="onFormSubmit"
          class="space-y-4"
        >
          <!-- Email Field -->
          <div class="flex flex-col gap-1">
            <CustomInput
              name="email"
              label="Email address"
              type="text"
            />
            <Message
              v-if="$form.email?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.email.error?.message }}
            </Message>
          </div>

          <!-- Password Field -->
          <div class="flex flex-col gap-1">
            <CustomInput
              name="password"
              label="Password"
              type="password"
            />
            <Message
              v-if="$form.password?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.password.error?.message }}
            </Message>
          </div>

          <!-- Options -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <Checkbox
                v-model="rememberMe"
                :binary="true"
              />
              <span class="text-gray-600">Remember me</span>
            </label>

            <a
              href="#"
              class="text-blue-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <!-- Submit Button -->
          <LoadingButton
            type="submit"
            :disabled="authStore.isLoading"
            :loading="authStore.isLoading"
            class="h-12 w-full"
          >
            Sign in
          </LoadingButton>
        </Form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
