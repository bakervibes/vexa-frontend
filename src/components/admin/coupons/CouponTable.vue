<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Coupon, CouponType } from '@/types'
import { Edit, MoreHorizontal, Percent, Tag, Trash2 } from 'lucide-vue-next'

interface Props {
  coupons: Coupon[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', coupon: Coupon): void
  (e: 'delete', coupon: Coupon): void
}>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string | Date | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatValue(value: number, type: CouponType): string {
  if (type === 'PERCENTAGE') {
    return `${value}%`
  }
  return formatCurrency(value)
}

function isExpired(expiresAt: Date | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

function getStatusBadge(coupon: Coupon): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
} {
  if (!coupon.isActive) {
    return { label: 'Inactif', variant: 'outline' }
  }
  if (isExpired(coupon.expiresAt)) {
    return { label: 'Expiré', variant: 'destructive' }
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { label: 'Épuisé', variant: 'secondary' }
  }
  return { label: 'Actif', variant: 'default' }
}

function getUsageText(coupon: Coupon): string {
  if (coupon.usageLimit) {
    return `${coupon.usageCount}/${coupon.usageLimit}`
  }
  return `${coupon.usageCount}`
}
</script>

<template>
  <div class="rounded-md border">
    <table class="w-full">
      <thead>
        <tr class="bg-muted/50 border-b">
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Code
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Type
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Valeur
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Utilisations
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Expiration
          </th>
          <th
            class="text-muted-foreground h-12 px-4 text-left align-middle text-sm font-medium"
          >
            Statut
          </th>
          <th
            class="text-muted-foreground h-12 w-[80px] px-4 text-right align-middle text-sm font-medium"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading state -->
        <tr v-if="loading">
          <td
            colspan="7"
            class="h-24 text-center"
          >
            <div class="flex items-center justify-center">
              <svg
                class="text-muted-foreground h-6 w-6 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-else-if="coupons.length === 0">
          <td
            colspan="7"
            class="text-muted-foreground h-24 text-center text-sm"
          >
            Aucun coupon trouvé
          </td>
        </tr>

        <!-- Coupons -->
        <tr
          v-else
          v-for="coupon in coupons"
          :key="coupon.id"
          class="hover:bg-muted/50 border-b transition-colors"
        >
          <td class="p-4">
            <div class="flex items-center gap-2">
              <div
                class="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-md"
              >
                <Percent
                  v-if="coupon.type === 'PERCENTAGE'"
                  class="text-primary h-4 w-4"
                />
                <Tag
                  v-else
                  class="text-primary h-4 w-4"
                />
              </div>
              <div>
                <p class="font-mono font-medium">{{ coupon.code }}</p>
                <p
                  v-if="coupon.description"
                  class="text-muted-foreground max-w-[200px] truncate text-xs"
                >
                  {{ coupon.description }}
                </p>
              </div>
            </div>
          </td>
          <td class="p-4">
            <Badge variant="outline">
              {{ coupon.type === 'PERCENTAGE' ? 'Pourcentage' : 'Fixe' }}
            </Badge>
          </td>
          <td class="p-4 font-medium">
            {{ formatValue(coupon.value, coupon.type) }}
          </td>
          <td class="p-4">
            <span class="text-sm">{{ getUsageText(coupon) }}</span>
          </td>
          <td class="p-4">
            <span
              :class="[
                'text-sm',
                isExpired(coupon.expiresAt) && 'text-destructive',
              ]"
            >
              {{ formatDate(coupon.expiresAt) }}
            </span>
          </td>
          <td class="p-4">
            <Badge :variant="getStatusBadge(coupon).variant">
              {{ getStatusBadge(coupon).label }}
            </Badge>
          </td>
          <td class="p-4 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon"
                >
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="emit('edit', coupon)">
                  <Edit class="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="emit('delete', coupon)"
                >
                  <Trash2 class="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
