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
    <DialogContent class="max-h-[80vh] w-full max-w-6xl overflow-auto p-6">
      <DetailsSection
        :slug="slug"
        :is-modal="true"
      />
    </DialogContent>
  </Dialog>
</template>
