<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import CustomSelect from '@/components/custom/custom-select.vue'
import CustomSwitch from '@/components/custom/custom-switch.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { useAddresses } from '@/composables/useAddresses'
import type { Address } from '@/types'
import { getAllCountries } from '@/utils/countries'
import { createAddressSchema } from '@/validators/addresses.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'

const {
  addresses,
  isLoadingAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  isCreatingAddress,
  isUpdatingAddress,
  isDeletingAddress,
} = useAddresses()

// Modal state
const isModalOpen = ref(false)
const editingAddress = ref<Address | null>(null)
const deletingAddressId = ref<string | null>(null)

// Delete confirmation dialog state
const isDeleteDialogOpen = ref(false)
const addressToDelete = ref<Address | null>(null)

const form = useForm({
  validationSchema: toTypedSchema(createAddressSchema),
  initialValues: {
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    country: '',
    isDefault: false,
  },
})

// Watch for modal close to reset form
watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    editingAddress.value = null
    form.resetForm()
  }
})

const openCreateModal = () => {
  editingAddress.value = null
  form.resetForm()
  isModalOpen.value = true
}

const openEditModal = (address: Address) => {
  editingAddress.value = address
  form.setValues({
    name: address.name,
    email: address.email,
    phone: address.phone,
    street: address.street,
    city: address.city,
    country: address.country,
    isDefault: address.isDefault,
  })
  isModalOpen.value = true
}

const onSubmit = form.handleSubmit(async (values) => {
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
})

const openDeleteDialog = (address: Address) => {
  addressToDelete.value = address
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!addressToDelete.value) return

  deletingAddressId.value = addressToDelete.value.id
  try {
    await deleteAddress(addressToDelete.value.id)
    isDeleteDialogOpen.value = false
    addressToDelete.value = null
  } finally {
    deletingAddressId.value = null
  }
}

const cancelDelete = () => {
  isDeleteDialogOpen.value = false
  addressToDelete.value = null
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
        size="sm"
        type="button"
        :disabled="isDeletingAddress"
      >
        <PlusIcon class="mr-2 h-4 w-4" />
        Add Address
      </Button>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoadingAddresses"
      class="grid gap-4 md:grid-cols-2"
    >
      <Skeleton
        v-for="i in 2"
        :key="i"
        class="h-40 rounded-lg"
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
        variant="outline"
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
            variant="ghost"
            size="sm"
            class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <PencilIcon class="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div class="space-y-1 text-sm text-gray-600">
          <p class="font-medium text-gray-900">{{ address.name }}</p>
          <p class="text-gray-700">{{ address.email }}</p>
          <p>{{ address.phone }}</p>
          <p>{{ formatAddress(address) }}</p>
        </div>

        <div class="mt-4 flex justify-end">
          <LoadingButton
            variant="ghost"
            size="sm"
            :loading="isDeletingAddress && deletingAddressId === address.id"
            :disabled="isDeletingAddress"
            type="button"
            @click="openDeleteDialog(address)"
            class="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2Icon class="mr-1 h-4 w-4" />
            Delete
          </LoadingButton>
        </div>
      </div>
    </div>

    <!-- Add/Edit Address Modal -->
    <AlertDialog v-model:open="isModalOpen">
      <AlertDialogContent class="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {{ editingAddress ? 'Edit Address' : 'Add New Address' }}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {{
              editingAddress
                ? 'Update your address details below.'
                : 'Fill in your address details below.'
            }}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form
          @submit="onSubmit"
          class="space-y-4"
        >
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

          <FormField
            v-slot="{ componentField }"
            name="email"
          >
            <FormItem>
              <CustomInput
                v-bind="componentField"
                label="Email *"
                type="email"
              />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="phone"
          >
            <FormItem>
              <CustomPhoneInput
                v-bind="componentField"
                label="Phone *"
              />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="street"
          >
            <FormItem>
              <CustomInput
                v-bind="componentField"
                label="Street Address *"
                type="text"
              />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="city"
          >
            <FormItem>
              <CustomInput
                v-bind="componentField"
                label="City *"
                type="text"
              />
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="country"
          >
            <FormItem>
              <CustomSelect
                :model-value="value"
                @update:model-value="handleChange"
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
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="isDefault"
          >
            <FormItem>
              <CustomSwitch
                :model-value="value"
                @update:model-value="handleChange"
                label="Set as default"
                description="Use this address as your default shipping address"
              />
              <FormMessage />
            </FormItem>
          </FormField>

          <div class="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
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
        </form>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog v-model:open="isDeleteDialogOpen">
      <AlertDialogContent class="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this address?
            <span
              v-if="addressToDelete"
              class="mt-2 block font-medium text-gray-900"
            >
              {{ addressToDelete.name }} - {{ addressToDelete.street }},
              {{ addressToDelete.city }}
            </span>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div class="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            @click="cancelDelete"
            :disabled="isDeletingAddress"
          >
            Cancel
          </Button>
          <LoadingButton
            type="button"
            variant="destructive"
            :loading="isDeletingAddress"
            :disabled="isDeletingAddress"
            @click="confirmDelete"
          >
            <Trash2Icon class="mr-1 h-4 w-4" />
            Delete
          </LoadingButton>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<style scoped></style>
