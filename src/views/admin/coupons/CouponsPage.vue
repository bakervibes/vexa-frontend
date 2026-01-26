<script setup lang="ts">
import { CouponForm, CouponTable } from '@/components/admin/coupons'
import { AdminPageHeader, ConfirmDialog } from '@/components/admin/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCoupons } from '@/composables/useCoupons'
import type { CreateCouponInput } from '@/services/coupons.service'
import type { Coupon } from '@/types'
import { Plus } from 'lucide-vue-next'
import { ref } from 'vue'

const {
  coupons,
  isLoading,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  isCreating,
  isUpdating,
  isDeleting,
} = useCoupons()

const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const couponToEdit = ref<Coupon | null>(null)
const couponToDelete = ref<Coupon | null>(null)

function handleCreate() {
  couponToEdit.value = null
  showFormDialog.value = true
}

function handleEdit(coupon: Coupon) {
  couponToEdit.value = coupon
  showFormDialog.value = true
}

function handleDelete(coupon: Coupon) {
  couponToDelete.value = coupon
  showDeleteDialog.value = true
}

async function handleSubmit(data: CreateCouponInput) {
  let success: boolean
  if (couponToEdit.value) {
    const result = await updateCoupon(couponToEdit.value.id, data)
    success = result !== null
  } else {
    const result = await createCoupon(data)
    success = result !== null
  }

  if (success) {
    showFormDialog.value = false
    couponToEdit.value = null
  }
}

async function confirmDelete() {
  if (!couponToDelete.value) return
  const result = await deleteCoupon(couponToDelete.value.id)
  if (result) {
    showDeleteDialog.value = false
    couponToDelete.value = null
  }
}

function handleCancel() {
  showFormDialog.value = false
  couponToEdit.value = null
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Coupons"
      description="Gérez vos codes promotionnels"
    >
      <template #actions>
        <Button @click="handleCreate">
          <Plus class="mr-2 h-4 w-4" />
          Nouveau coupon
        </Button>
      </template>
    </AdminPageHeader>

    <!-- Coupons Table -->
    <CouponTable
      :coupons="coupons"
      :loading="isLoading"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showFormDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {{ couponToEdit ? 'Modifier le coupon' : 'Nouveau coupon' }}
          </DialogTitle>
        </DialogHeader>
        <CouponForm
          :coupon="couponToEdit"
          :loading="isCreating || isUpdating"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      title="Supprimer le coupon"
      :description="`Êtes-vous sûr de vouloir supprimer le coupon « ${couponToDelete?.code} » ? Cette action est irréversible.`"
      confirm-text="Supprimer"
      variant="destructive"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
