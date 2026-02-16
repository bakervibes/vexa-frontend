<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { computed, ref, watch } from 'vue'

interface Props {
  open: boolean
  selectedCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'apply', data: { basePrice: number; price?: number }): void
}>()

// Form state
const basePrice = ref<number | undefined>(undefined)
const price = ref<number | undefined>(undefined)

// Validation
const canSubmit = computed(() => {
  return basePrice.value !== undefined && basePrice.value >= 0
})

// Reset form when dialog closes
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      basePrice.value = undefined
      price.value = undefined
    }
  },
)

function handleSubmit() {
  if (!canSubmit.value || basePrice.value === undefined) return
  emit('apply', {
    basePrice: basePrice.value,
    price: price.value,
  })
}

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Appliquer un prix</DialogTitle>
        <DialogDescription>
          Appliquer les memes prix a {{ selectedCount }} variante(s)
          selectionnee(s).
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Base Price -->
        <div class="space-y-2">
          <Label for="bulk-base-price">
            Prix de base
            <span class="text-destructive">*</span>
          </Label>
          <Input
            id="bulk-base-price"
            v-model.number="basePrice"
            type="number"
            min="0"
            step="100"
            placeholder="Prix de base (obligatoire)"
          />
        </div>

        <!-- Sale Price -->
        <div class="space-y-2">
          <Label for="bulk-price">Prix de vente (optionnel)</Label>
          <Input
            id="bulk-price"
            v-model.number="price"
            type="number"
            min="0"
            step="100"
            placeholder="Prix de vente"
          />
        </div>

        <!-- Preview -->
        <div class="bg-muted rounded-lg p-3">
          <p class="text-muted-foreground text-sm">
            {{ selectedCount }} variante(s) recevront :
          </p>
          <ul class="mt-1 space-y-1 text-sm">
            <li v-if="basePrice !== undefined">
              Prix de base :
              <span class="font-medium">
                {{ basePrice.toLocaleString() }} FCFA
              </span>
            </li>
            <li v-if="price !== undefined">
              Prix de vente :
              <span class="font-medium">{{ price.toLocaleString() }} FCFA</span>
            </li>
          </ul>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          type="button"
          @click="close"
        >
          Annuler
        </Button>
        <Button
          :disabled="!canSubmit"
          type="button"
          @click="handleSubmit"
        >
          Appliquer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
