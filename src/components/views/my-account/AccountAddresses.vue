<script setup lang="ts">
import CustomInput from '@/components/custom/custom-input.vue'
import CustomPhoneInput from '@/components/custom/custom-phone-input.vue'
import CustomSelect from '@/components/custom/custom-select.vue'
import CustomSwitch from '@/components/custom/custom-switch.vue'
import LoadingButton from '@/components/custom/loading-button.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAddressesMutation,
  useUserAddresses,
} from '@/composables/useAddresses'
import type { Address } from '@/types'
import { getAllCountries } from '@/utils/countries'
import { createAddressSchema } from '@/validators/addresses.validator'
import { toTypedSchema } from '@vee-validate/zod'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
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

// Form setup with vee-validate and zod
const form = useForm({
  validationSchema: toTypedSchema(createAddressSchema),
  initialValues: {
    id: null,
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
  form.resetForm({
    values: {
      id: null,
      name: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      country: '',
      isDefault: false,
    },
  })
  isModalOpen.value = true
}

const openEditModal = (address: Address) => {
  editingAddress.value = address
  form.resetForm({
    values: {
      id: address.id,
      name: address.name,
      email: address.email,
      phone: address.phone,
      street: address.street,
      city: address.city,
      country: address.country,
      isDefault: address.isDefault,
    },
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
        size="sm"
        class="gap-2"
        type="button"
        :disabled="isDeletingAddress"
      >
        <PlusIcon class="h-4 w-4" />
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
            variant="ghost"
            size="sm"
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
      :open="isModalOpen"
      @update:open="isModalOpen = $event"
    >
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ editingAddress ? 'Edit Address' : 'Add New Address' }}
          </DialogTitle>
          <DialogDescription>
            {{
              editingAddress
                ? 'Update your address details below.'
                : 'Fill in your address details below.'
            }}
          </DialogDescription>
        </DialogHeader>

        <form
          @submit="onSubmit"
          class="space-y-4"
        >
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

          <FormField
            v-slot="{ componentField }"
            name="street"
          >
            <FormItem>
              <FormControl>
                <CustomInput
                  label="Street Address *"
                  type="text"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="city"
          >
            <FormItem>
              <FormControl>
                <CustomInput
                  label="City *"
                  type="text"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="country"
          >
            <FormItem>
              <FormControl>
                <CustomSelect
                  label="Country *"
                  :options="
                    getAllCountries().map((country) => ({
                      label: country.name,
                      value: country.name,
                    }))
                  "
                  search-placeholder="Search country..."
                  placeholder="Select a country"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="isDefault"
          >
            <FormItem>
              <FormControl>
                <CustomSwitch
                  label="Set as default"
                  description="Use this address as your default shipping address"
                  v-bind="componentField"
                />
              </FormControl>
            </FormItem>
          </FormField>

          <DialogFooter class="gap-2 sm:gap-0">
            <DialogClose as-child>
              <Button
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </DialogClose>
            <LoadingButton
              type="submit"
              :loading="isCreatingAddress || isUpdatingAddress"
              :disabled="isCreatingAddress || isUpdatingAddress"
            >
              {{ editingAddress ? 'Update' : 'Save' }} Address
            </LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped></style>
