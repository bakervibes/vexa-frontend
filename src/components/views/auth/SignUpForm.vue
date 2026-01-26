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
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const { register, isRegistering, registerError } = useAuth()
const redirect = route.query.redirect as string | undefined
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
  const result = await register({
    name: formValues.name,
    email: formValues.email,
    password: formValues.password,
  })

  if (result.success) {
    toast.success('Compte créé avec succès', {
      description: 'Bienvenue sur Vexa !',
    })
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
        alt="Sign up"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- SECTION FORMULAIRE -->
    <div class="flex h-full w-full items-center justify-center p-4 md:p-6">
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
          <RouterLink
            :to="
              redirect ? `/auth/sign-in?redirect=${redirect}` : '/auth/sign-in'
            "
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
              <span class="text-gray-600">
                I agree to the
                <RouterLink
                  to="/terms-and-conditions"
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
