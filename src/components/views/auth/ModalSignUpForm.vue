<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { useAuthStore } from '@/stores/auth'
import { registerBodySchema } from '@/validators/auth.validator'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const emit = defineEmits<{
  (e: 'switch-to-login'): void
  (e: 'success'): void
}>()

const authStore = useAuthStore()
const acceptTerms = ref(false)

const initialValues = {
  name: '',
  email: '',
  password: '',
}

const resolver = zodResolver(registerBodySchema)

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

  const result = await authStore.register(values)

  if (result.success) {
    emit('success')
  }
}
</script>

<template>
  <div class="grid h-[70vh] w-full grid-cols-1 md:grid-cols-2">
    <!-- SECTION IMAGE (à gauche sur desktop) -->
    <div class="hidden h-full w-full overflow-hidden md:block">
      <img
        src="/auth.png"
        alt="Sign up"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- SECTION FORMULAIRE (à droite sur desktop) -->
    <div class="flex h-full w-full items-center justify-center p-6 md:p-8">
      <div class="w-full max-w-md space-y-4">
        <h2 class="text-3xl font-bold">Create an account</h2>

        <!-- Error Message -->
        <Message
          v-if="authStore.error"
          severity="error"
          :closable="false"
        >
          {{ authStore.error }}
        </Message>

        <p class="mt-2 text-gray-600">
          Already have an account?
          <button
            type="button"
            @click="emit('switch-to-login')"
            class="cursor-pointer text-blue-600 hover:underline"
          >
            Sign in
          </button>
        </p>

        <Form
          v-slot="$form"
          :initialValues="initialValues"
          :resolver="resolver"
          @submit="onFormSubmit"
          class="space-y-4"
        >
          <!-- Name Field -->
          <div class="flex flex-col gap-1">
            <CustomInput
              name="name"
              label="Username"
              type="text"
            />
            <Message
              v-if="$form.name?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form.name.error?.message }}
            </Message>
          </div>

          <!-- Email Field -->
          <div class="flex flex-col gap-1">
            <CustomInput
              name="email"
              label="Email address"
              type="email"
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
          <div class="flex items-center">
            <label class="flex items-center gap-2">
              <Checkbox
                v-model="acceptTerms"
                :binary="true"
              />
              <span class="text-sm text-gray-600">
                I agree to the
                <RouterLink
                  to="/terms-and-conditions"
                  class="text-blue-600 hover:underline"
                >
                  terms
                </RouterLink>
                and
                <RouterLink
                  to="/terms-and-conditions"
                  class="text-blue-600 hover:underline"
                >
                  conditions of use
                </RouterLink>
              </span>
            </label>
          </div>

          <!-- Submit Button -->
          <LoadingButton
            type="submit"
            :disabled="authStore.isLoading"
            :loading="authStore.isLoading"
            class="h-12 w-full"
          >
            Create an account
          </LoadingButton>
        </Form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
