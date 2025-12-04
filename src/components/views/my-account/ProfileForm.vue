<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { useUsersMutation } from '@/composables/useUsers'
import { useAuthStore } from '@/stores/auth'
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/validators/users.validator'
import { Form } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import Message from 'primevue/message'
import { ref, watch } from 'vue'

const authStore = useAuthStore()
const { updateProfile, isUpdatingProfile } = useUsersMutation()

// Initial values pour le formulaire
const initialValues = ref({
  name: '',
  email: '',
  phone: '',
})

// Mettre à jour les valeurs initiales quand l'utilisateur est disponible
watch(
  () => authStore.user,
  (user) => {
    if (user) {
      initialValues.value = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      }
    }
  },
  { immediate: true },
)

const resolver = zodResolver(updateProfileSchema)

const onFormSubmit = async ({
  valid,
  values,
}: {
  valid: boolean
  values: typeof initialValues.value
}) => {
  if (!valid) return

  try {
    await updateProfile(values as UpdateProfileInput)
  } catch (error) {
    console.error('Error updating profile:', error)
  }
}
</script>

<template>
  <section>
    <h2 class="mb-6 text-xl font-semibold">Account Details</h2>

    <Form
      v-slot="$form"
      :key="JSON.stringify(initialValues)"
      :initialValues="initialValues"
      :resolver="resolver"
      @submit="onFormSubmit"
      class="max-w-lg space-y-5"
    >
      <!-- Full Name -->
      <div class="flex flex-col gap-1">
        <CustomInput
          name="name"
          label="Full Name *"
          type="text"
        />
        <Message
          v-if="$form.name?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.name.error?.message }}
        </Message>
      </div>

      <!-- Email -->
      <div class="flex flex-col gap-1">
        <CustomInput
          name="email"
          label="Email *"
          type="email"
        />
        <Message
          v-if="$form.email?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.email.error?.message }}
        </Message>
      </div>

      <!-- Phone -->
      <div class="flex flex-col gap-1">
        <CustomPhoneInput
          name="phone"
          label="Phone *"
        />
        <Message
          v-if="$form.phone?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.phone.error?.message }}
        </Message>
      </div>

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
    </Form>
  </section>
</template>

<style scoped></style>
