<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useUsersMutation } from '@/composables/useUsers'
import { useAuthStore } from '@/stores/auth'
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/validators/users.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { watch } from 'vue'

const authStore = useAuthStore()
const { updateProfile, isUpdatingProfile } = useUsersMutation()

// Form setup with vee-validate and zod
const form = useForm({
  validationSchema: toTypedSchema(updateProfileSchema),
  initialValues: {
    name: '',
    email: '',
    phone: '',
  },
})

// Initialize form with user data when available
watch(
  () => authStore.user,
  (user) => {
    if (user) {
      form.setValues({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  },
  { immediate: true },
)

const onSubmit = form.handleSubmit(async (values) => {
  try {
    await updateProfile(values as UpdateProfileInput)
  } catch (error) {
    console.error('Error updating profile:', error)
  }
})
</script>

<template>
  <section>
    <h2 class="mb-6 text-xl font-semibold">Account Details</h2>

    <form
      @submit="onSubmit"
      class="max-w-lg space-y-5"
    >
      <!-- Full Name -->
      <FormField
        v-slot="{ componentField }"
        name="name"
      >
        <FormItem>
          <FormControl>
            <CustomInput
              label="Full Name *"
              type="text"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Email -->
      <FormField
        v-slot="{ componentField }"
        name="email"
      >
        <FormItem>
          <FormControl>
            <CustomInput
              label="Email *"
              type="email"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Phone -->
      <FormField
        v-slot="{ componentField }"
        name="phone"
      >
        <FormItem>
          <FormControl>
            <CustomPhoneInput
              label="Phone *"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <LoadingButton
          type="submit"
          :loading="isUpdatingProfile"
          :disabled="isUpdatingProfile"
          class="h-12"
        >
          Save changes
        </LoadingButton>
      </div>
    </form>
  </section>
</template>

<style scoped></style>
