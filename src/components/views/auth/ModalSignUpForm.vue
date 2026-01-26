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
        <Alert
          v-if="registerError"
          variant="destructive"
        >
          <AlertDescription>
            {{ registerError }}
          </AlertDescription>
        </Alert>

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
              <CustomInput
                v-bind="componentField"
                label="Full Name"
                type="text"
              />
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Email Field -->
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
          <div class="flex items-center">
            <label class="flex items-center gap-2">
              <Checkbox
                :checked="acceptTerms"
                @update:checked="acceptTerms = $event"
              />
              <span class="text-sm text-gray-600">
                I agree to the
                <RouterLink
                  to="/terms"
                  class="text-blue-600 hover:underline"
                >
                  terms
                </RouterLink>
                and
                <RouterLink
                  to="/privacy-policy"
                  class="text-blue-600 hover:underline"
                >
                  privacy policy
                </RouterLink>
              </span>
            </label>
          </div>

          <!-- Submit Button -->
          <LoadingButton
            type="submit"
            :disabled="isRegistering"
            :loading="isRegistering"
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
