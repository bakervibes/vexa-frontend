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
  (e: 'apply', stock: number): void
}>()

// Form state
const stock = ref<number | undefined>(undefined)

// Validation
const canSubmit = computed(() => {
  return stock.value !== undefined && stock.value >= 0
})

// Reset form when dialog closes
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      stock.value = undefined
    }
  },
)

function handleSubmit() {
  if (!canSubmit.value || stock.value === undefined) return
  emit('apply', stock.value)
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
        <DialogTitle>Definir le stock initial</DialogTitle>
        <DialogDescription>
          Appliquer le meme stock a {{ selectedCount }} variante(s)
          selectionnee(s).
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Stock -->
        <div class="space-y-2">
          <Label for="bulk-stock">Quantite en stock</Label>
          <Input
            id="bulk-stock"
            v-model.number="stock"
            type="number"
            min="0"
            placeholder="Quantite initiale"
          />
        </div>

        <!-- Preview -->
        <div
          v-if="stock !== undefined && stock >= 0"
          class="bg-muted rounded-lg p-3"
        >
          <p class="text-muted-foreground text-sm">
            {{ selectedCount }} variante(s) auront un stock de
            <span class="font-medium">{{ stock }} unite(s)</span>
          </p>
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
