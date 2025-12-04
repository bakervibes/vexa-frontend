<script setup lang="ts">
import { Dialog, DialogContent } from '@/components/ui/dialog'
import DetailsSection from './DetailsSection.vue'

defineProps<{
  slug: string
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="handleOpenChange"
  >
    <DialogContent
      class="max-h-[90vh] w-full max-w-5xl! overflow-y-auto p-6"
      :show-close-button="true"
    >
      <DetailsSection
        :slug="slug"
        :is-modal="true"
      />
    </DialogContent>
  </Dialog>
</template>
