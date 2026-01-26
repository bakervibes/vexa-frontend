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
import { RouterLink } from 'vue-router'

const emit = defineEmits<{
  (e: 'switch-to-register'): void
  (e: 'success'): void
}>()

const { login, isLogingIn, loginError } = useAuth()
const rememberMe = ref(false)

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(loginBodySchema),
  initialValues: {
    email: '',
    password: '',
  },
})

const onSubmit = handleSubmit(async (formValues: LoginInput) => {
  const result = await login(formValues)

  if (result.success) {
    emit('success')
  }
})
</script>

<template>
  <div class="grid h-fit w-full grid-cols-1 md:h-[80vh] md:grid-cols-2">
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
        <Alert
          v-if="loginError"
          variant="destructive"
        >
          <AlertDescription>
            {{ loginError }}
          </AlertDescription>
        </Alert>

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
              <span class="text-sm text-gray-600">Remember me</span>
            </label>

            <RouterLink
              to="/forgot-password"
              class="text-sm text-blue-600 hover:underline"
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
