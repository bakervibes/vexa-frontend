<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { CreateCouponInput } from '@/services/coupons.service'
import type { Coupon } from '@/types'
import { Loader2 } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

interface Props {
  coupon?: Coupon | null
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'submit', data: CreateCouponInput): void
  (e: 'cancel'): void
}>()

const form = ref<CreateCouponInput>({
  code: '',
  description: '',
  value: 0,
  type: 'PERCENTAGE',
  usageLimit: undefined,
  minOrderAmount: undefined,
  expiresAt: undefined,
  isActive: true,
})

watch(
  () => props.coupon,
  (coupon) => {
    if (coupon) {
      form.value = {
        code: coupon.code,
        description: coupon.description || '',
        value: coupon.value,
        type: coupon.type,
        usageLimit: coupon.usageLimit || undefined,
        minOrderAmount: coupon.minOrderAmount || undefined,
        expiresAt: coupon.expiresAt
          ? new Date(coupon.expiresAt).toISOString().split('T')[0]
          : undefined,
        isActive: coupon.isActive,
      }
    } else {
      form.value = {
        code: '',
        description: '',
        value: 0,
        type: 'PERCENTAGE',
        usageLimit: undefined,
        minOrderAmount: undefined,
        expiresAt: undefined,
        isActive: true,
      }
    }
  },
  { immediate: true },
)

// Auto-uppercase code
watch(
  () => form.value.code,
  (code) => {
    form.value.code = code.toUpperCase().replace(/[^A-Z0-9]/g, '')
  },
)

const isEditing = computed(() => !!props.coupon)

const valueLabel = computed(() => {
  return form.value.type === 'PERCENTAGE' ? 'Réduction (%)' : 'Réduction (FCFA)'
})

const valuePlaceholder = computed(() => {
  return form.value.type === 'PERCENTAGE' ? 'Ex: 10' : 'Ex: 5000'
})

function handleSubmit() {
  const data: CreateCouponInput = {
    ...form.value,
    usageLimit: form.value.usageLimit || undefined,
    minOrderAmount: form.value.minOrderAmount || undefined,
    expiresAt: form.value.expiresAt || undefined,
  }
  emit('submit', data)
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <!-- Code & Type -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="code">Code du coupon *</Label>
        <Input
          id="code"
          v-model="form.code"
          placeholder="Ex: PROMO2024"
          required
          :disabled="isEditing"
        />
        <p
          v-if="isEditing"
          class="text-muted-foreground text-xs"
        >
          Le code ne peut pas être modifié
        </p>
      </div>

      <div class="space-y-2">
        <Label for="type">Type de réduction *</Label>
        <Select v-model="form.type">
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner le type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="PERCENTAGE">Pourcentage (%)</SelectItem>
              <SelectItem value="FIXED">Montant fixe (FCFA)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Value & Min Order -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="value">{{ valueLabel }} *</Label>
        <Input
          id="value"
          v-model.number="form.value"
          type="number"
          :placeholder="valuePlaceholder"
          :min="0"
          :max="form.type === 'PERCENTAGE' ? 100 : undefined"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="minOrderAmount">Montant minimum de commande</Label>
        <Input
          id="minOrderAmount"
          v-model.number="form.minOrderAmount"
          type="number"
          placeholder="Ex: 10000"
          :min="0"
        />
        <p class="text-muted-foreground text-xs">
          Laisser vide pour aucun minimum
        </p>
      </div>
    </div>

    <!-- Usage Limit & Expiration -->
    <div class="grid gap-6 md:grid-cols-2">
      <div class="space-y-2">
        <Label for="usageLimit">Limite d'utilisation</Label>
        <Input
          id="usageLimit"
          v-model.number="form.usageLimit"
          type="number"
          placeholder="Ex: 100"
          :min="1"
        />
        <p class="text-muted-foreground text-xs">
          Nombre maximum d'utilisations (vide = illimité)
        </p>
      </div>

      <div class="space-y-2">
        <Label for="expiresAt">Date d'expiration</Label>
        <Input
          id="expiresAt"
          v-model="form.expiresAt"
          type="date"
        />
        <p class="text-muted-foreground text-xs">
          Laisser vide pour pas d'expiration
        </p>
      </div>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <Label for="description">Description</Label>
      <Textarea
        id="description"
        v-model="form.description"
        placeholder="Description interne du coupon..."
        rows="2"
      />
    </div>

    <!-- Active Status -->
    <div class="flex items-center gap-3">
      <Switch
        id="isActive"
        v-model:checked="form.isActive"
      />
      <Label for="isActive">Coupon actif</Label>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-4">
      <Button
        type="button"
        variant="outline"
        @click="emit('cancel')"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        :disabled="loading"
      >
        <Loader2
          v-if="loading"
          class="mr-2 h-4 w-4 animate-spin"
        />
        {{ isEditing ? 'Mettre à jour' : 'Créer le coupon' }}
      </Button>
    </div>
  </form>
</template>
