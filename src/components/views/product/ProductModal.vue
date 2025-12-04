<script setup lang="ts">
import Dialog from 'primevue/dialog'
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
    :visible="open"
    @update:visible="handleOpenChange"
    modal
    :style="{ width: '80rem', maxWidth: '90vw' }"
    :contentStyle="{ maxHeight: '90vh', overflow: 'auto', padding: '1.5rem' }"
    :dismissableMask="true"
    :showHeader="false"
  >
    <DetailsSection
      :slug="slug"
      :is-modal="true"
    />
  </Dialog>
</template>
