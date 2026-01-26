<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import {
  forgotPasswordBodySchema,
  type ForgotPasswordInput,
} from '@/validators/auth.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { CheckCircle2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { ref } from 'vue'

const { forgotPassword, forgotPasswordError, isForgotingPassword } = useAuth()
const isSuccess = ref(false)

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(forgotPasswordBodySchema),
  initialValues: {
    email: '',
  },
})

const onSubmit = handleSubmit(async (formValues: ForgotPasswordInput) => {
  const result = await forgotPassword(formValues.email)

  if (result.success) {
    isSuccess.value = true
  }
})
</script>

<template>
  <div class="grid h-screen w-full grid-cols-1 md:grid-cols-2">
    <!-- SECTION IMAGE -->
    <div class="hidden h-full w-full overflow-hidden md:block">
      <img
        src="/auth.png"
        alt="Forgot Password"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- SECTION FORMULAIRE -->
    <div class="flex h-full w-full items-center justify-center p-4 md:p-6">
      <div class="w-full max-w-md space-y-4">
        <h2 class="text-3xl font-bold">Forgot Password</h2>

        <!-- Success Message -->
        <Alert
          v-if="isSuccess"
          variant="default"
          class="border-green-500 text-green-700"
        >
          <CheckCircle2 class="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            If an account exists with this email, you will receive a password
            reset link shortly.
            <div class="mt-2">
              <RouterLink
                to="/auth/sign-in"
                class="font-medium underline hover:text-green-800"
              >
                Back to Sign in
              </RouterLink>
            </div>
          </AlertDescription>
        </Alert>

        <template v-else>
          <p class="text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          <!-- Error Message -->
          <Alert
            v-if="forgotPasswordError"
            variant="destructive"
          >
            <AlertDescription>
              {{ forgotPasswordError }}
            </AlertDescription>
          </Alert>

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

            <!-- Actions -->
            <div class="flex flex-col gap-4">
              <LoadingButton
                type="submit"
                :disabled="isForgotingPassword"
                :loading="isForgotingPassword"
                class="h-12 w-full"
              >
                Send Reset Link
              </LoadingButton>

              <div class="text-center text-sm">
                <RouterLink
                  to="/auth/sign-in"
                  class="text-blue-600 hover:underline"
                >
                  Back to Sign in
                </RouterLink>
              </div>
            </div>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>
