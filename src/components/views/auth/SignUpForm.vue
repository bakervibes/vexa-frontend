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
import { useRoute, useRouter } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const redirect = route.query.redirect as string | undefined

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
  const result = await authStore.register({
    name: values.name,
    email: values.email,
    password: values.password,
  })

  if (result.success) {
    router.push(redirect || '/')
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
          <RouterLink
            to="/auth/sign-in"
            class="text-blue-600 hover:underline"
          >
            Sign in
          </RouterLink>
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
              <span class="text-gray-600">
                I agree to the
                <a
                  href="#"
                  class="text-blue-600 hover:underline"
                >
                  terms
                </a>
                and
                <a
                  href="#"
                  class="text-blue-600 hover:underline"
                >
                  conditions of use
                </a>
              </span>
            </label>
          </div>

          <!-- Submit Button -->
          <LoadingButton
            :disabled="authStore.isLoading"
            :loading="authStore.isLoading"
            class="w-full"
          >
            Create an account
          </LoadingButton>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
