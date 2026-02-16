<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import { emailSchema } from '@/validators/common.schemas'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { watch } from 'vue'
import { toast } from 'vue-sonner'
import { z } from 'zod'

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
  <section class="border border-[#1E1E1E] bg-[#0A0A0A] p-6">
    <h2 class="mb-2 text-xs tracking-[0.3em] text-[#C8A97E] uppercase">
      Email Address
    </h2>
    <p class="text-text-muted mb-6 text-sm">
      A verification email will be sent to your new address
    </p>

    <form
      @submit="onSubmit"
      class="max-w-lg space-y-5"
    >
      <div class="bg-surface border border-[#1E1E1E] p-4">
        <p class="mb-1 text-xs tracking-widest text-[#555] uppercase">
          Current email
        </p>
        <p class="text-[#E8E8E8]">{{ user?.email }}</p>
      </div>

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

      <div class="flex justify-end">
        <LoadingButton
          type="submit"
          :loading="isChangingEmail"
          :disabled="isChangingEmail"
          class="border border-[#C8A97E]/40 px-6 py-2 text-xs tracking-widest text-[#C8A97E] uppercase transition-colors hover:bg-[#C8A97E] hover:text-[#0A0A0A]"
        >
          Change email
        </LoadingButton>
      </div>
    </form>
  </section>
</template>

<style scoped></style>
