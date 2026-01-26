<script setup lang="ts">
import {
  AdminPageHeader,
  ConfirmDialog,
  EmptyState,
} from '@/components/admin/shared'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  shippingService,
  type CreateOptionInput,
  type CreateZoneInput,
  type ShippingOption,
  type ShippingZone,
} from '@/services/shipping.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  ChevronRight,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Truck,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'

const queryClient = useQueryClient()

// Fetch zones
const { data: zonesData, isLoading: isLoadingZones } = useQuery({
  queryKey: ['shippingZones'],
  queryFn: () => shippingService.getAllZones(),
})

const zones = computed(() => zonesData.value || [])

// Expanded zones
const expandedZones = ref<Set<string>>(new Set())

function toggleZone(shippingZoneId: string) {
  if (expandedZones.value.has(shippingZoneId)) {
    expandedZones.value.delete(shippingZoneId)
  } else {
    expandedZones.value.add(shippingZoneId)
  }
}

// Zone dialog
const isZoneDialogOpen = ref(false)
const editingZone = ref<ShippingZone | null>(null)
const zoneForm = ref<CreateZoneInput>({
  name: '',
  description: '',
  countries: [],
  cities: [],
  isDefault: false,
  isActive: true,
})
const countriesInput = ref('')
const citiesInput = ref('')

function openZoneDialog(zone?: ShippingZone) {
  if (zone) {
    editingZone.value = zone
    zoneForm.value = {
      name: zone.name,
      description: zone.description || '',
      countries: zone.countries,
      cities: zone.cities,
      isDefault: zone.isDefault,
      isActive: zone.isActive,
    }
    countriesInput.value = zone.countries.join(', ')
    citiesInput.value = zone.cities.join(', ')
  } else {
    editingZone.value = null
    zoneForm.value = {
      name: '',
      description: '',
      countries: [],
      cities: [],
      isDefault: false,
      isActive: true,
    }
    countriesInput.value = ''
    citiesInput.value = ''
  }
  isZoneDialogOpen.value = true
}

const zoneMutation = useMutation({
  mutationFn: async () => {
    const data = {
      ...zoneForm.value,
      countries: countriesInput.value
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      cities: citiesInput.value
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
    }
    if (editingZone.value) {
      return shippingService.updateZone(editingZone.value.id, data)
    }
    return shippingService.createZone(data)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['shippingZones'] })
    toast.success(editingZone.value ? 'Zone mise à jour' : 'Zone créée')
    isZoneDialogOpen.value = false
  },
  onError: () => {
    toast.error("Erreur lors de l'opération")
  },
})

// Option dialog
const isOptionDialogOpen = ref(false)
const editingOption = ref<ShippingOption | null>(null)
const selectedZoneId = ref<string>('')
const optionForm = ref<Omit<CreateOptionInput, 'shippingZoneId'>>({
  name: '',
  description: '',
  type: 'STANDARD',
  price: 0,
  freeThreshold: undefined,
  minOrderAmount: undefined,
  delayMinDays: 1,
  delayMaxDays: 5,
  codAllowed: true,
  isActive: true,
  position: 0,
})

function openOptionDialog(shippingZoneId: string, option?: ShippingOption) {
  selectedZoneId.value = shippingZoneId
  if (option) {
    editingOption.value = option
    optionForm.value = {
      name: option.name,
      description: option.description || '',
      type: option.type,
      price: option.price,
      freeThreshold: option.freeThreshold || undefined,
      minOrderAmount: option.minOrderAmount || undefined,
      delayMinDays: option.delayMinDays,
      delayMaxDays: option.delayMaxDays,
      codAllowed: option.codAllowed,
      isActive: option.isActive,
      position: option.position,
    }
  } else {
    editingOption.value = null
    optionForm.value = {
      name: '',
      description: '',
      type: 'STANDARD',
      price: 0,
      freeThreshold: undefined,
      minOrderAmount: undefined,
      delayMinDays: 1,
      delayMaxDays: 5,
      codAllowed: true,
      isActive: true,
      position: 0,
    }
  }
  isOptionDialogOpen.value = true
}

const optionMutation = useMutation({
  mutationFn: async () => {
    const data = {
      ...optionForm.value,
      shippingZoneId: selectedZoneId.value,
    }
    if (editingOption.value) {
      return shippingService.updateOption(editingOption.value.id, data)
    }
    return shippingService.createOption(data)
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['shippingZones'] })
    toast.success(editingOption.value ? 'Option mise à jour' : 'Option créée')
    isOptionDialogOpen.value = false
  },
  onError: () => {
    toast.error("Erreur lors de l'opération")
  },
})

// Delete
const deleteZoneId = ref<string | null>(null)
const deleteOptionId = ref<string | null>(null)

const deleteZoneMutation = useMutation({
  mutationFn: (id: string) => shippingService.deleteZone(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['shippingZones'] })
    toast.success('Zone supprimée')
    deleteZoneId.value = null
  },
  onError: () => {
    toast.error('Erreur lors de la suppression')
  },
})

const deleteOptionMutation = useMutation({
  mutationFn: (id: string) => shippingService.deleteOption(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['shippingZones'] })
    toast.success('Option supprimée')
    deleteOptionId.value = null
  },
  onError: () => {
    toast.error('Erreur lors de la suppression')
  },
})

function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price)
}

function getTypeBadge(type: string) {
  const types: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'outline' }
  > = {
    STANDARD: { label: 'Standard', variant: 'default' },
    EXPRESS: { label: 'Express', variant: 'secondary' },
    PICKUP: { label: 'Retrait', variant: 'outline' },
  }
  return types[type] || { label: type, variant: 'default' }
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Livraison"
      description="Gérez les zones et options de livraison"
    >
      <template #actions>
        <Button @click="openZoneDialog()">
          <Plus class="mr-2 h-4 w-4" />
          Nouvelle zone
        </Button>
      </template>
    </AdminPageHeader>

    <!-- Loading -->
    <div
      v-if="isLoadingZones"
      class="flex h-48 items-center justify-center"
    >
      <Loader2 class="text-muted-foreground h-8 w-8 animate-spin" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="zones.length === 0"
      class="bg-card rounded-xl border p-8"
    >
      <EmptyState
        title="Aucune zone de livraison"
        description="Créez votre première zone pour commencer"
        :icon="Globe"
      >
        <template #action>
          <Button @click="openZoneDialog()">
            <Plus class="mr-2 h-4 w-4" />
            Créer une zone
          </Button>
        </template>
      </EmptyState>
    </div>

    <!-- Zones List -->
    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="zone in zones"
        :key="zone.id"
        class="bg-card overflow-hidden rounded-xl border"
      >
        <!-- Zone Header -->
        <div
          class="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4"
          @click="toggleZone(zone.id)"
        >
          <div class="flex items-center gap-3">
            <ChevronRight
              :class="[
                'h-5 w-5 transition-transform',
                expandedZones.has(zone.id) && 'rotate-90',
              ]"
            />
            <Globe class="text-muted-foreground h-5 w-5" />
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold">{{ zone.name }}</h3>
                <Badge
                  v-if="zone.isDefault"
                  variant="secondary"
                >
                  Par défaut
                </Badge>
                <Badge
                  v-if="!zone.isActive"
                  variant="destructive"
                >
                  Inactif
                </Badge>
              </div>
              <p class="text-muted-foreground text-sm">
                {{ zone.countries.join(', ') || 'Aucun pays' }}
                <span v-if="zone.cities.length > 0">
                  · {{ zone.cities.length }} ville(s)
                </span>
              </p>
            </div>
          </div>
          <div
            class="flex items-center gap-2"
            @click.stop
          >
            <Button
              variant="ghost"
              size="icon"
              @click="openZoneDialog(zone)"
            >
              <Pencil class="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              :disabled="zone.isDefault"
              @click="deleteZoneId = zone.id"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Zone Options -->
        <div
          v-if="expandedZones.has(zone.id)"
          class="border-t"
        >
          <div class="bg-muted/30 p-4">
            <div class="mb-4 flex items-center justify-between">
              <h4 class="flex items-center gap-2 font-medium">
                <Truck class="h-4 w-4" />
                Options de livraison
              </h4>
              <Button
                size="sm"
                variant="outline"
                @click="openOptionDialog(zone.id)"
              >
                <Plus class="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>

            <div
              v-if="!zone.options?.length"
              class="text-muted-foreground py-8 text-center"
            >
              Aucune option de livraison
            </div>

            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="option in zone.options"
                :key="option.id"
                class="bg-card flex items-center justify-between rounded-lg border p-3"
              >
                <div class="flex items-center gap-3">
                  <Badge :variant="getTypeBadge(option.type).variant">
                    {{ getTypeBadge(option.type).label }}
                  </Badge>
                  <div>
                    <p class="font-medium">{{ option.name }}</p>
                    <p class="text-muted-foreground text-sm">
                      {{ option.delayMinDays }}-{{ option.delayMaxDays }} jours
                      <span
                        v-if="!option.isActive"
                        class="text-destructive"
                      >
                        · Inactif
                      </span>
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p class="font-semibold">{{ formatPrice(option.price) }}</p>
                    <p
                      v-if="option.freeThreshold"
                      class="text-muted-foreground text-xs"
                    >
                      Gratuit dès {{ formatPrice(option.freeThreshold) }}
                    </p>
                  </div>
                  <div class="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      @click="openOptionDialog(zone.id, option)"
                    >
                      <Pencil class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      @click="deleteOptionId = option.id"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Zone Dialog -->
    <Dialog v-model:open="isZoneDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {{ editingZone ? 'Modifier la zone' : 'Nouvelle zone' }}
          </DialogTitle>
          <DialogDescription>
            Configurez une zone de livraison
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="zone-name">Nom</Label>
            <Input
              id="zone-name"
              v-model="zoneForm.name"
              placeholder="ex: Côte d'Ivoire"
            />
          </div>

          <div class="space-y-2">
            <Label for="zone-description">Description</Label>
            <Textarea
              id="zone-description"
              v-model="zoneForm.description"
              placeholder="Description optionnelle"
              rows="2"
            />
          </div>

          <div class="space-y-2">
            <Label for="zone-countries">
              Pays (codes ISO, séparés par virgule)
            </Label>
            <Input
              id="zone-countries"
              v-model="countriesInput"
              placeholder="ex: CI, SN, ML"
            />
            <p class="text-muted-foreground text-xs">
              Codes ISO 3166-1 alpha-2 (CI = Côte d'Ivoire, FR = France, etc.)
            </p>
          </div>

          <div class="space-y-2">
            <Label for="zone-cities">Villes (séparées par virgule)</Label>
            <Input
              id="zone-cities"
              v-model="citiesInput"
              placeholder="ex: Abidjan, Bouaké, Yamoussoukro"
            />
          </div>

          <div class="flex items-center justify-between">
            <Label for="zone-default">Zone par défaut</Label>
            <Switch
              id="zone-default"
              :checked="zoneForm.isDefault"
              @update:checked="zoneForm.isDefault = $event"
            />
          </div>

          <div class="flex items-center justify-between">
            <Label for="zone-active">Active</Label>
            <Switch
              id="zone-active"
              :checked="zoneForm.isActive"
              @update:checked="zoneForm.isActive = $event"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="isZoneDialogOpen = false"
          >
            Annuler
          </Button>
          <Button
            :disabled="zoneMutation.isPending.value || !zoneForm.name"
            @click="zoneMutation.mutate()"
          >
            <Loader2
              v-if="zoneMutation.isPending.value"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ editingZone ? 'Mettre à jour' : 'Créer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Option Dialog -->
    <Dialog v-model:open="isOptionDialogOpen">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {{ editingOption ? "Modifier l'option" : 'Nouvelle option' }}
          </DialogTitle>
          <DialogDescription>
            Configurez une option de livraison
          </DialogDescription>
        </DialogHeader>

        <div class="max-h-[60vh] space-y-4 overflow-y-auto py-4">
          <div class="space-y-2">
            <Label for="option-name">Nom</Label>
            <Input
              id="option-name"
              v-model="optionForm.name"
              placeholder="ex: Livraison standard"
            />
          </div>

          <div class="space-y-2">
            <Label for="option-type">Type</Label>
            <Select v-model="optionForm.type">
              <SelectTrigger id="option-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="EXPRESS">Express</SelectItem>
                <SelectItem value="PICKUP">Retrait en magasin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="option-price">Prix (XOF)</Label>
              <Input
                id="option-price"
                v-model.number="optionForm.price"
                type="number"
                min="0"
              />
            </div>
            <div class="space-y-2">
              <Label for="option-free">Gratuit dès (XOF)</Label>
              <Input
                id="option-free"
                v-model.number="optionForm.freeThreshold"
                type="number"
                min="0"
                placeholder="Optionnel"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="option-min-days">Délai min (jours)</Label>
              <Input
                id="option-min-days"
                v-model.number="optionForm.delayMinDays"
                type="number"
                min="0"
              />
            </div>
            <div class="space-y-2">
              <Label for="option-max-days">Délai max (jours)</Label>
              <Input
                id="option-max-days"
                v-model.number="optionForm.delayMaxDays"
                type="number"
                min="0"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="option-min-order">Commande minimum (XOF)</Label>
            <Input
              id="option-min-order"
              v-model.number="optionForm.minOrderAmount"
              type="number"
              min="0"
              placeholder="Optionnel"
            />
          </div>

          <div class="flex items-center justify-between">
            <div>
              <Label>Paiement à la livraison</Label>
              <p class="text-muted-foreground text-xs">
                Autoriser le paiement en espèces
              </p>
            </div>
            <Switch
              :checked="optionForm.codAllowed"
              @update:checked="optionForm.codAllowed = $event"
            />
          </div>

          <div class="flex items-center justify-between">
            <Label>Active</Label>
            <Switch
              :checked="optionForm.isActive"
              @update:checked="optionForm.isActive = $event"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="isOptionDialogOpen = false"
          >
            Annuler
          </Button>
          <Button
            :disabled="optionMutation.isPending.value || !optionForm.name"
            @click="optionMutation.mutate()"
          >
            <Loader2
              v-if="optionMutation.isPending.value"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ editingOption ? 'Mettre à jour' : 'Créer' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Zone Confirm -->
    <ConfirmDialog
      :open="!!deleteZoneId"
      title="Supprimer la zone"
      description="Cette action est irréversible. Toutes les options de livraison associées seront également supprimées."
      :is-loading="deleteZoneMutation.isPending.value"
      @confirm="deleteZoneId && deleteZoneMutation.mutate(deleteZoneId)"
      @cancel="deleteZoneId = null"
    />

    <!-- Delete Option Confirm -->
    <ConfirmDialog
      :open="!!deleteOptionId"
      title="Supprimer l'option"
      description="Cette action est irréversible."
      :is-loading="deleteOptionMutation.isPending.value"
      @confirm="deleteOptionId && deleteOptionMutation.mutate(deleteOptionId)"
      @cancel="deleteOptionId = null"
    />
  </div>
</template>
