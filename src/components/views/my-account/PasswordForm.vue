<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import { changePasswordSchema } from '@/validators/users.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'

const { changePassword, isChangingPassword } = useAuth()

const form = useForm({
  validationSchema: toTypedSchema(changePasswordSchema),
  initialValues: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
})

const onSubmit = form.handleSubmit(async (values) => {
  const result = await changePassword({
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
  })

  if (result.success) {
    toast.success('Password changed', {
      description: 'Your password has been changed successfully.',
    })
    form.resetForm()
  } else {
    toast.error('Error', {
      description: result.error || 'Failed to change password.',
    })
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
          <CustomInput
            v-bind="componentField"
            label="Current Password *"
            type="password"
          />
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- New Password -->
      <FormField
        v-slot="{ componentField }"
        name="newPassword"
      >
        <FormItem>
          <CustomInput
            v-bind="componentField"
            label="New Password *"
            type="password"
          />
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Confirm Password -->
      <FormField
        v-slot="{ componentField }"
        name="confirmPassword"
      >
        <FormItem>
          <CustomInput
            v-bind="componentField"
            label="Confirm New Password *"
            type="password"
          />
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <LoadingButton
          type="submit"
          :loading="isChangingPassword"
          :disabled="isChangingPassword"
        >
          Change password
        </LoadingButton>
      </div>
    </form>
  </section>
</template>

<style scoped></style>
