<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import {
  resetPasswordBodySchema,
  type ResetPasswordInput,
} from '@/validators/auth.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { CheckCircle2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { resetPassword, resetPasswordError, isResettingPassword } = useAuth()
const isSuccess = ref(false)
const token = ref<string>('')

onMounted(() => {
  const queryToken = route.query.token as string
  if (!queryToken) {
    // If no token, redirect to sign in or show error
    // For now, let's redirect
    router.replace('/auth/sign-in')
    return
  }
  token.value = queryToken
})

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(resetPasswordBodySchema),
  initialValues: {
    password: '',
    confirmPassword: '',
  },
})

const onSubmit = handleSubmit(async (formValues: ResetPasswordInput) => {
  if (!token.value) return

  const result = await resetPassword(formValues.password)

  if (result.success) {
    isSuccess.value = true
    // Automatically redirect after a few seconds?
    setTimeout(() => {
      router.push('/auth/sign-in')
    }, 3000)
  }
})
</script>

<template>
  <div class="grid h-screen w-full grid-cols-1 md:grid-cols-2">
    <!-- SECTION IMAGE -->
    <div class="hidden h-full w-full overflow-hidden md:block">
      <img
        src="/auth.png"
        alt="Reset Password"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- SECTION FORMULAIRE -->
    <div class="flex h-full w-full items-center justify-center p-4 md:p-6">
      <div class="w-full max-w-md space-y-4">
        <h2 class="text-3xl font-bold">Reset Password</h2>

        <!-- Success Message -->
        <Alert
          v-if="isSuccess"
          variant="default"
          class="border-green-500 text-green-700"
        >
          <CheckCircle2 class="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your password has been successfully reset. Redirecting to sign in...
            <div class="mt-2">
              <RouterLink
                to="/auth/sign-in"
                class="font-medium underline hover:text-green-800"
              >
                Click here if you are not redirected
              </RouterLink>
            </div>
          </AlertDescription>
        </Alert>

        <template v-else>
          <p class="text-gray-600">Enter your new password below.</p>

          <!-- Error Message -->
          <Alert
            v-if="resetPasswordError"
            variant="destructive"
          >
            <AlertDescription>
              {{ resetPasswordError }}
            </AlertDescription>
          </Alert>

          <form
            @submit="onSubmit"
            class="space-y-4"
          >
            <!-- Password Field -->
            <FormField
              v-slot="{ componentField }"
              name="password"
            >
              <FormItem>
                <CustomInput
                  v-bind="componentField"
                  label="New Password"
                  type="password"
                />
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Confirm Password Field -->
            <FormField
              v-slot="{ componentField }"
              name="confirmPassword"
            >
              <FormItem>
                <CustomInput
                  v-bind="componentField"
                  label="Confirm Password"
                  type="password"
                />
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Actions -->
            <div class="flex flex-col gap-4">
              <LoadingButton
                type="submit"
                :disabled="isResettingPassword"
                :loading="isResettingPassword"
                class="h-12 w-full"
              >
                Reset Password
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
