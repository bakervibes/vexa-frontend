<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { useUsersMutation } from '@/composables/useUsers'
import { changePasswordSchema } from '@/validators/users.validator'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Message from 'primevue/message'
import { ref } from 'vue'

const { changePassword, isChangingPassword } = useUsersMutation()

const initialValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

const resolver = zodResolver(changePasswordSchema)
const formKey = ref(0)

const onFormSubmit = async ({ valid, values }: FormSubmitEvent) => {
  if (!valid) return

  try {
    await changePassword(values as typeof initialValues)
    // Reset form on success
    formKey.value++
  } catch (error) {
    console.error('Error changing password:', error)
  }
}
</script>

<template>
  <section>
    <h2 class="mb-6 text-xl font-semibold">Password</h2>

    <Form
      v-slot="$form"
      :key="formKey"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="max-w-lg space-y-5"
    >
      <!-- Current Password -->
      <div class="flex flex-col gap-1">
        <CustomInput
          name="currentPassword"
          label="Current Password *"
          type="password"
        />
        <Message
          v-if="$form.currentPassword?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.currentPassword.error?.message }}
        </Message>
      </div>

      <!-- New Password -->
      <div class="flex flex-col gap-1">
        <CustomInput
          name="newPassword"
          label="New Password *"
          type="password"
        />
        <Message
          v-if="$form.newPassword?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.newPassword.error?.message }}
        </Message>
      </div>

      <!-- Confirm Password -->
      <div class="flex flex-col gap-1">
        <CustomInput
          name="confirmPassword"
          label="Confirm New Password *"
          type="password"
        />
        <Message
          v-if="$form.confirmPassword?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.confirmPassword.error?.message }}
        </Message>
      </div>

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
    </Form>
  </section>
</template>

<style scoped></style>
