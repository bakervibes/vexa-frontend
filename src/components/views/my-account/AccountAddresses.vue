<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import CustomSelect from '@/components/custom/custom-select.vue'
import CustomSwitch from '@/components/custom/custom-switch.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import {
  useAddressesMutation,
  useUserAddresses,
} from '@/composables/useAddresses'
import type { Address } from '@/types'
import { getAllCountries } from '@/utils/countries'
import {
  createAddressSchema,
  type CreateAddressInput,
} from '@/validators/addresses.validator'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-vue-next'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import { ref, watch } from 'vue'

const { addresses, isLoading } = useUserAddresses()
const {
  createAddress,
  updateAddress,
  deleteAddress,
  isCreatingAddress,
  isUpdatingAddress,
  isDeletingAddress,
} = useAddressesMutation()

// Modal state
const isModalOpen = ref(false)
const editingAddress = ref<Address | null>(null)
const deletingAddressId = ref<string | null>(null)
const formKey = ref(0)

// Initial form values
const initialValues = ref({
  id: null as string | null,
  name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  country: '',
  isDefault: false,
})

const resolver = zodResolver(createAddressSchema)

// Watch for modal close to reset form
watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    editingAddress.value = null
    initialValues.value = {
      id: null,
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      country: '',
      isDefault: false,
    }
    formKey.value++
  }
})

const openCreateModal = () => {
  editingAddress.value = null
  initialValues.value = {
    id: null,
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    country: '',
    isDefault: false,
  }
  formKey.value++
  isModalOpen.value = true
}

const openEditModal = (address: Address) => {
  editingAddress.value = address
  initialValues.value = {
    id: address.id,
    name: address.name,
    email: address.email,
    phone: address.phone,
    street: address.street,
    city: address.city,
    country: address.country,
    isDefault: address.isDefault,
  }
  formKey.value++
  isModalOpen.value = true
}

const onFormSubmit = async ({
  valid,
  values,
}: FormSubmitEvent<CreateAddressInput>) => {
  if (!valid) return

  try {
    if (editingAddress.value) {
      await updateAddress(editingAddress.value.id, values)
    } else {
      await createAddress(values)
    }
    isModalOpen.value = false
  } catch (error) {
    console.error('Error saving address:', error)
  }
}

const handleDelete = async (id: string) => {
  deletingAddressId.value = id
  try {
    await deleteAddress(id)
  } finally {
    deletingAddressId.value = null
  }
}

// Format address for display
const formatAddress = (address: Address) => {
  const parts = [address.street, address.city]
  parts.push(address.country)
  return parts.join(', ')
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Address</h2>
      <Button
        @click="openCreateModal"
        size="small"
        type="button"
        :disabled="isDeletingAddress"
      >
        <PlusIcon class="mr-2 h-4 w-4" />
        Add Address
      </Button>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="grid gap-4 md:grid-cols-2"
    >
      <Skeleton
        v-for="i in 2"
        :key="i"
        height="10rem"
        class="rounded-lg"
      />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="addresses.length === 0"
      class="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-12 text-center"
    >
      <p class="text-gray-500">No addresses saved yet</p>
      <Button
        @click="openCreateModal"
        outlined
        type="button"
      >
        Add your first address
      </Button>
    </div>

    <!-- Address Cards -->
    <div
      v-else
      class="grid gap-4 md:grid-cols-2"
    >
      <div
        v-for="(address, index) in addresses"
        :key="address.id"
        class="rounded-lg border p-5"
      >
        <div class="mb-4 flex items-start justify-between">
          <h3 class="font-semibold">
            {{ index === 0 ? 'Billing Address' : 'Shipping Address' }}
            <span
              v-if="address.isDefault"
              class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-600"
            >
              Default
            </span>
          </h3>
          <Button
            @click="openEditModal(address)"
            type="button"
            :disabled="isDeletingAddress"
            text
            size="small"
            class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <PencilIcon class="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div class="space-y-1 text-sm text-gray-600">
          <p class="font-medium text-gray-900">{{ address.name }}</p>
          <p>{{ address.phone }}</p>
          <p>{{ formatAddress(address) }}</p>
        </div>

        <div class="mt-4 flex justify-end">
          <LoadingButton
            text
            size="small"
            :loading="isDeletingAddress && deletingAddressId === address.id"
            :disabled="isDeletingAddress"
            type="button"
            @click="handleDelete(address.id)"
            class="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2Icon class="mr-1 h-4 w-4" />
            Delete
          </LoadingButton>
        </div>
      </div>
    </div>

    <!-- Add/Edit Address Modal -->
    <Dialog
      v-model:visible="isModalOpen"
      modal
      :header="editingAddress ? 'Edit Address' : 'Add New Address'"
      :style="{ width: '28rem' }"
      :dismissableMask="true"
    >
      <p class="mb-4 text-sm text-gray-500">
        {{
          editingAddress
            ? 'Update your address details below.'
            : 'Fill in your address details below.'
        }}
      </p>

      <Form
        v-slot="$form"
        :key="formKey"
        :initialValues="initialValues"
        :resolver="resolver"
        @submit="onFormSubmit"
        class="space-y-4"
      >
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

        <div class="flex flex-col gap-1">
          <CustomInput
            name="street"
            label="Street Address *"
            type="text"
          />
          <Message
            v-if="$form.street?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.street.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <CustomInput
            name="city"
            label="City *"
            type="text"
          />
          <Message
            v-if="$form.city?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.city.error?.message }}
          </Message>
        </div>

        <div class="flex flex-col gap-1">
          <CustomSelect
            name="country"
            label="Country *"
            :options="
              getAllCountries().map((country) => ({
                label: country.name,
                value: country.name,
              }))
            "
            search-placeholder="Search country..."
            placeholder="Select a country"
          />
          <Message
            v-if="$form.country?.invalid"
            severity="error"
            size="small"
            variant="simple"
          >
            {{ $form.country.error?.message }}
          </Message>
        </div>

        <CustomSwitch
          name="isDefault"
          label="Set as default"
          description="Use this address as your default shipping address"
        />

        <div class="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            outlined
            @click="isModalOpen = false"
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            :loading="isCreatingAddress || isUpdatingAddress"
            :disabled="isCreatingAddress || isUpdatingAddress"
          >
            {{ editingAddress ? 'Update' : 'Save' }} Address
          </LoadingButton>
        </div>
      </Form>
    </Dialog>
  </div>
</template>

<style scoped></style>
