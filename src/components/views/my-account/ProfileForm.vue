<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/composables/useAuth'
import { userService } from '@/services/users.service'
import { updateProfileSchema } from '@/validators/users.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const { user, updateProfile, isUpdatingProfile } = useAuth()
const isUpdatingPhone = ref(false)

const form = useForm({
  validationSchema: toTypedSchema(updateProfileSchema),
  initialValues: {
    name: '',
    phone: '',
  },
})

// Mettre à jour les valeurs quand l'utilisateur est disponible
watch(
  user,
  (currentUser) => {
    if (currentUser) {
      form.setValues({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
      })
    }
  },
  { immediate: true },
)

const onSubmit = form.handleSubmit(async (values) => {
  try {
    // Update name via better-auth
    if (values.name && values.name !== user.value?.name) {
      const result = await updateProfile({ name: values.name })
      if (!result.success) {
        toast.error('Error', {
          description: result.error || 'Failed to update name.',
        })
        return
      }
    }

    // Update phone via custom API (better-auth doesn't handle phone)
    if (values.phone !== user.value?.phone) {
      isUpdatingPhone.value = true
      try {
        await userService.updateProfile({ phone: values.phone })
      } finally {
        isUpdatingPhone.value = false
      }
    }

    toast.success('Profile updated', {
      description: 'Your information has been saved.',
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error('Error', {
      description: 'Failed to update profile.',
    })
  }
})

const isLoading = ref(false)
watch([isUpdatingProfile, isUpdatingPhone], ([profile, phone]) => {
  isLoading.value = profile || phone
})
</script>

<template>
  <section>
    <h2 class="mb-6 text-xl font-semibold">Account Details</h2>

    <form
      @submit="onSubmit"
      class="max-w-lg space-y-5"
    >
      <!-- Name -->
      <FormField
        v-slot="{ componentField }"
        name="name"
      >
        <FormItem>
          <CustomInput
            v-bind="componentField"
            label="Full Name *"
            type="text"
          />
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Phone -->
      <FormField
        v-slot="{ componentField }"
        name="phone"
      >
        <FormItem>
          <CustomPhoneInput
            v-bind="componentField"
            label="Phone"
          />
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <LoadingButton
          type="submit"
          :loading="isLoading"
          :disabled="isLoading"
        >
          Save changes
        </LoadingButton>
      </div>
    </form>
  </section>
</template>

<style scoped></style>
