<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { useUsersMutation } from '@/composables/useUsers'
import { changePasswordSchema } from '@/validators/users.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

const { changePassword, isChangingPassword } = useUsersMutation()

// Form setup with vee-validate and zod
const form = useForm({
  validationSchema: toTypedSchema(changePasswordSchema),
  initialValues: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
})

const onSubmit = form.handleSubmit(async (values) => {
  try {
    await changePassword(values)
    // Reset form on success
    form.resetForm()
  } catch (error) {
    console.error('Error changing password:', error)
  }
})
</script>

<template>
  <section>
    <h2 class="mb-6 text-xl font-semibold">Password</h2>

    <form
      @submit="onSubmit"
      class="max-w-lg space-y-5"
    >
      <!-- Current Password -->
      <FormField
        v-slot="{ componentField }"
        name="currentPassword"
      >
        <FormItem>
          <FormControl>
            <CustomInput
              label="Current Password *"
              type="password"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- New Password -->
      <FormField
        v-slot="{ componentField }"
        name="newPassword"
      >
        <FormItem>
          <FormControl>
            <CustomInput
              label="New Password *"
              type="password"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Confirm Password -->
      <FormField
        v-slot="{ componentField }"
        name="confirmPassword"
      >
        <FormItem>
          <FormControl>
            <CustomInput
              label="Confirm New Password *"
              type="password"
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
          :loading="isChangingPassword"
          :disabled="isChangingPassword"
          class="h-12"
        >
          Change password
        </LoadingButton>
      </div>
    </form>
  </section>
</template>

<style scoped></style>
