<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import { emailSchema } from '@/validators/common.schemas'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { watch } from 'vue'
import { z } from 'zod'
import { toast } from 'vue-sonner'

const { user, changeEmail, isChangingEmail } = useAuth()

const changeEmailFormSchema = z.object({
  newEmail: emailSchema,
})

const form = useForm({
  validationSchema: toTypedSchema(changeEmailFormSchema),
  initialValues: {
    newEmail: '',
  },
})

// Pre-fill with current email when user is available
watch(
  user,
  (currentUser) => {
    if (currentUser) {
      form.setFieldValue('newEmail', currentUser.email || '')
    }
  },
  { immediate: true },
)

const onSubmit = form.handleSubmit(async (values) => {
  // Check if email actually changed
  if (values.newEmail === user.value?.email) {
    toast.info('Email unchanged', {
      description: 'The new email is the same as your current email.',
    })
    return
  }

  const result = await changeEmail(values.newEmail)

  if (result.success) {
    toast.success('Verification email sent', {
      description: 'Please check your new email to confirm the change.',
    })
  } else {
    toast.error('Error', {
      description: result.error || 'Failed to change email.',
    })
  }
})
</script>

<template>
  <section>
    <h2 class="mb-2 text-xl font-semibold">Email Address</h2>
    <p class="mb-6 text-sm text-gray-500">
      A verification email will be sent to your new address
    </p>

    <form
      @submit="onSubmit"
      class="max-w-lg space-y-5"
    >
      <!-- Current Email (readonly info) -->
      <div class="rounded-md bg-gray-50 p-3">
        <p class="text-sm text-gray-600">
          Current email:
          <span class="font-medium text-gray-900">{{ user?.email }}</span>
        </p>
      </div>

      <!-- New Email -->
      <FormField
        v-slot="{ componentField }"
        name="newEmail"
      >
        <FormItem>
          <CustomInput
            v-bind="componentField"
            label="New Email *"
            type="email"
          />
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <LoadingButton
          type="submit"
          :loading="isChangingEmail"
          :disabled="isChangingEmail"
        >
          Change email
        </LoadingButton>
      </div>
    </form>
  </section>
</template>

<style scoped></style>
