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
import { Textarea } from '@/components/ui/textarea'
import { Minus, Plus } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

interface Props {
  open: boolean
  selectedCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (
    e: 'apply',
    data: { type: 'add' | 'remove'; quantity: number; note: string },
  ): void
}>()

// Form state
const type = ref<'add' | 'remove'>('add')
const quantity = ref(1)
const note = ref('')

// Validation
const canSubmit = computed(() => {
  if (quantity.value < 1) return false
  if (type.value === 'remove' && !note.value.trim()) return false
  return true
})

// Reset form when dialog closes
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      type.value = 'add'
      quantity.value = 1
      note.value = ''
    }
  },
)

function handleSubmit() {
  if (!canSubmit.value) return
  emit('apply', {
    type: type.value,
    quantity: quantity.value,
    note: note.value,
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
        <DialogTitle>Ajustement groupé du stock</DialogTitle>
        <DialogDescription>
          Appliquer un ajustement à {{ selectedCount }} variante(s)
          sélectionnée(s).
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Type selection -->
        <div class="space-y-2">
          <Label>Type d'ajustement</Label>
          <div class="flex gap-4">
            <Button
              :variant="type === 'add' ? 'default' : 'outline'"
              class="flex-1"
              type="button"
              @click="type = 'add'"
            >
              <Plus class="mr-2 h-4 w-4" />
              Ajouter
            </Button>
            <Button
              :variant="type === 'remove' ? 'destructive' : 'outline'"
              class="flex-1"
              type="button"
              @click="type = 'remove'"
            >
              <Minus class="mr-2 h-4 w-4" />
              Retirer
            </Button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="space-y-2">
          <Label for="bulk-quantity">Quantité</Label>
          <Input
            id="bulk-quantity"
            v-model.number="quantity"
            type="number"
            min="1"
            placeholder="Quantité à appliquer"
          />
        </div>

        <!-- Note (required for removal) -->
        <div class="space-y-2">
          <Label for="bulk-note">
            Note
            <span
              v-if="type === 'remove'"
              class="text-destructive"
            >
              *
            </span>
          </Label>
          <Textarea
            id="bulk-note"
            v-model="note"
            :placeholder="
              type === 'remove'
                ? 'Raison du retrait (obligatoire)...'
                : 'Note optionnelle...'
            "
            rows="2"
          />
          <p
            v-if="type === 'remove' && !note.trim()"
            class="text-destructive text-xs"
          >
            Une note est obligatoire pour les retraits de stock
          </p>
        </div>

        <!-- Preview -->
        <div class="bg-muted rounded-lg p-3">
          <p class="text-muted-foreground text-sm">
            {{ selectedCount }} variante(s) :
            <span
              :class="type === 'add' ? 'text-green-600' : 'text-red-600'"
              class="font-medium"
            >
              {{ type === 'add' ? '+' : '-' }}{{ quantity }} unité(s) chacune
            </span>
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
