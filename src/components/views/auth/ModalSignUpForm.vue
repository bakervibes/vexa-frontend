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
import { registerBodySchema } from '@/validators/auth.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { RouterLink } from 'vue-router'
import { watch } from 'vue'

const emit = defineEmits<{
  (e: 'switch-to-login'): void
  (e: 'success'): void
}>()

const authStore = useAuthStore()

const form = useForm({
  validationSchema: toTypedSchema(registerBodySchema),
  initialValues: {
    name: '',
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
  const result = await authStore.register(values)

  if (result.success) {
    emit('success')
  }
})
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
        <div
          v-if="authStore.error"
          class="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {{ authStore.error }}
        </div>

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

        <form
          @submit="onSubmit"
          class="space-y-4"
        >
          <!-- Name Field -->
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormControl>
                <CustomInput
                  label="Username"
                  type="text"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Email Field -->
          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <FormControl>
                <CustomInput
                  label="Email address"
                  type="email"
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
          <div class="flex items-center">
            <label class="flex items-center">
              <input
                type="checkbox"
                class="mr-2 h-4 w-4 rounded border-gray-300"
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
            :disabled="authStore.isLoading"
            :loading="authStore.isLoading"
            class="h-12 w-full"
          >
            Create an account
          </LoadingButton>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
