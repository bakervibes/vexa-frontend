<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { useAuthStore } from '@/stores/auth'
import { loginBodySchema } from '@/validators/auth.validator'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'switch-to-register'): void
  (e: 'success'): void
}>()

const authStore = useAuthStore()
const rememberMe = ref(false)

const initialValues = {
  email: '',
  password: '',
}

const resolver = zodResolver(loginBodySchema)

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

  const result = await authStore.login(values)

  if (result.success) {
    emit('success')
  }
}
</script>

<template>
  <div class="grid h-fit w-full grid-cols-1 md:h-[70vh] md:grid-cols-2">
    <!-- SECTION IMAGE (à gauche sur desktop) -->
    <div class="hidden h-full w-full overflow-hidden md:block">
      <img
        src="/auth.png"
        alt="Sign in"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- SECTION FORMULAIRE (à droite sur desktop) -->
    <div class="flex h-full w-full items-center justify-center p-6 md:p-8">
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
          <button
            type="button"
            @click="emit('switch-to-register')"
            class="cursor-pointer text-blue-600 hover:underline"
          >
            Sign up
          </button>
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
              <span class="text-sm text-gray-600">Remember me</span>
            </label>

            <a
              href="#"
              class="text-sm text-blue-600 hover:underline"
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
