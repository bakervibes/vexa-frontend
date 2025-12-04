<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useAuthStore } from '@/stores/auth'
import { loginBodySchema } from '@/validators/auth.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { watch } from 'vue'

const emit = defineEmits<{
  (e: 'switch-to-register'): void
  (e: 'success'): void
}>()

const authStore = useAuthStore()

const form = useForm({
  validationSchema: toTypedSchema(loginBodySchema),
  initialValues: {
    email: '',
    password: '',
  },
})

// Réinitialiser l'erreur quand l'utilisateur tape
watch(form.values, () => {
  if (authStore.error) {
    authStore.error = null
  }
})

const onSubmit = form.handleSubmit(async (values) => {
  const result = await authStore.login(values)

  if (result.success) {
    emit('success')
  }
})
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
        <div
          v-if="authStore.error"
          class="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {{ authStore.error }}
        </div>

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
              <FormControl>
                <CustomInput
                  label="Email address"
                  type="text"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Password Field -->
          <FormField
            v-slot="{ componentField }"
            name="password"
          >
            <FormItem>
              <FormControl>
                <CustomInput
                  label="Password"
                  type="password"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Options -->
          <div class="flex items-center justify-between">
            <label class="flex items-center">
              <input
                type="checkbox"
                class="mr-2 h-4 w-4 rounded border-gray-300"
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
            :disabled="authStore.isLoading"
            :loading="authStore.isLoading"
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
