<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import {
  registerBodySchema,
  type RegisterInput,
} from '@/validators/auth.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const emit = defineEmits<{
  (e: 'switch-to-login'): void
  (e: 'success'): void
}>()

const { register, isRegistering, registerError } = useAuth()
const acceptTerms = ref(false)

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(registerBodySchema),
  initialValues: {
    name: '',
    email: '',
    password: '',
  },
})

const onSubmit = handleSubmit(async (formValues: RegisterInput) => {
  const result = await register(formValues)

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
        alt="Sign up"
        class="h-full w-full object-cover"
      />
    </div>

    <div
      class="flex h-full w-full items-center justify-center bg-[#0A0A0A] p-6 md:p-8"
    >
      <div class="w-full max-w-md space-y-6">
        <div class="space-y-2">
          <p class="text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
            Get started
          </p>
          <h2 class="font-display text-3xl text-[#E8E8E8]">
            Create an account
          </h2>
        </div>

        <Alert
          v-if="registerError"
          class="bg-surface border-[#1E1E1E] text-[#E8E8E8]"
        >
          <AlertDescription class="text-[#E8E8E8]">
            {{ registerError }}
          </AlertDescription>
        </Alert>

        <p class="text-text-muted">
          Already have an account?
          <button
            type="button"
            @click="emit('switch-to-login')"
            class="cursor-pointer text-[#C8A97E] hover:underline"
          >
            Sign in
          </button>
        </p>

        <form
          @submit="onSubmit"
          class="space-y-5"
        >
          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <CustomInput
                v-bind="componentField"
                label="Full Name"
                type="text"
              />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <CustomInput
                v-bind="componentField"
                label="Email address"
                type="email"
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

          <div class="flex items-center">
            <label class="flex items-center gap-2">
              <Checkbox
                :checked="acceptTerms"
                @update:checked="acceptTerms = $event"
                class="border-[#1E1E1E] data-[state=checked]:border-[#C8A97E] data-[state=checked]:bg-[#C8A97E]"
              />
              <span class="text-text-muted text-sm">
                I agree to the
                <RouterLink
                  to="/terms"
                  class="text-[#C8A97E] hover:underline"
                >
                  terms
                </RouterLink>
                and
                <RouterLink
                  to="/privacy-policy"
                  class="text-[#C8A97E] hover:underline"
                >
                  privacy policy
                </RouterLink>
              </span>
            </label>
          </div>

          <LoadingButton
            type="submit"
            :disabled="isRegistering"
            :loading="isRegistering"
            class="h-12 w-full border border-[#C8A97E]/40 bg-transparent tracking-wider text-[#C8A97E] uppercase hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
          >
            Create an account
          </LoadingButton>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
