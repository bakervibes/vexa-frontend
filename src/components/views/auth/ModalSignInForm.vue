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
    <div class="hidden h-full w-full overflow-hidden md:block">
      <img
        src="/auth.png"
        alt="Sign in"
        class="h-full w-full object-cover"
      />
    </div>

    <div
      class="flex h-full w-full items-center justify-center bg-[#0A0A0A] p-6 md:p-8"
    >
      <div class="w-full max-w-md space-y-6">
        <div class="space-y-2">
          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
            Welcome back
          </p>
          <h2 class="font-display text-3xl text-[#E8E8E8]">Sign in</h2>
        </div>

        <Alert
          v-if="loginError"
          class="bg-surface border-[#1E1E1E] text-[#E8E8E8]"
        >
          <AlertDescription class="text-[#E8E8E8]">
            {{ loginError }}
          </AlertDescription>
        </Alert>

        <p class="text-text-muted">
          Don't have an account?
          <button
            type="button"
            @click="emit('switch-to-register')"
            class="cursor-pointer text-[#C8A97E] hover:underline"
          >
            Sign up
          </button>
        </p>

        <form
          @submit="onSubmit"
          class="space-y-5"
        >
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

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2">
              <Checkbox
                :checked="rememberMe"
                @update:checked="rememberMe = $event"
                class="border-[#1E1E1E] data-[state=checked]:border-[#C8A97E] data-[state=checked]:bg-[#C8A97E]"
              />
              <span class="text-text-muted text-sm">Remember me</span>
            </label>

            <RouterLink
              to="/forgot-password"
              class="text-sm text-[#C8A97E] hover:underline"
            >
              Forgot password?
            </RouterLink>
          </div>

          <LoadingButton
            type="submit"
            :disabled="isLogingIn"
            :loading="isLogingIn"
            class="h-12 w-full border border-[#C8A97E]/40 bg-transparent tracking-wider text-[#C8A97E] uppercase hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
          >
            Sign in
          </LoadingButton>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
