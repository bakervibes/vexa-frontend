<script setup lang="ts">
import { AdminPageHeader } from '@/components/admin/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  settingsService,
  type Settings,
  type UpdateSettingsInput,
} from '@/services/settings.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  Bell,
  CreditCard,
  Globe,
  Loader2,
  Mail,
  Save,
  Store,
  Truck,
} from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const queryClient = useQueryClient()

const { data: settings, isLoading } = useQuery({
  queryKey: ['admin', 'settings'],
  queryFn: () => settingsService.getSettings(),
  staleTime: 1000 * 60 * 5,
})

// Local form state
const storeSettings = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  currency: 'XOF',
  language: 'fr',
  timezone: 'Africa/Abidjan',
})

const shippingSettings = ref({
  freeShippingThreshold: 50000,
  defaultShippingCost: 2000,
  enableLocalPickup: true,
  localPickupAddress: '',
  estimatedDeliveryDays: '2-5',
})

const paymentSettings = ref({
  enableCOD: true,
  enableMobileMoney: true,
  enableBankTransfer: false,
  mobileMoneyProviders: ['Orange Money', 'MTN Mobile Money', 'Wave'],
})

const notificationSettings = ref({
  orderConfirmation: true,
  orderShipped: true,
  orderDelivered: true,
  lowStockAlert: true,
  lowStockThreshold: 10,
  newsletterEnabled: false,
})

// Sync settings to form when loaded
watch(
  settings,
  (newSettings) => {
    if (newSettings) {
      storeSettings.value = { ...newSettings.store }
      shippingSettings.value = { ...newSettings.shipping }
      paymentSettings.value = { ...newSettings.payment }
      notificationSettings.value = { ...newSettings.notifications }
    }
  },
  { immediate: true },
)

const updateMutation = useMutation({
  mutationFn: (data: UpdateSettingsInput) =>
    settingsService.updateSettings(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
    toast.success('Paramètres sauvegardés')
  },
  onError: (error: Error) => {
    toast.error(error.message || 'Erreur lors de la sauvegarde')
  },
})

function saveSettings() {
  updateMutation.mutate({
    store: storeSettings.value,
    shipping: shippingSettings.value,
    payment: paymentSettings.value,
    notifications: notificationSettings.value,
  })
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Paramètres"
      description="Configurez les paramètres de votre boutique"
    >
      <template #actions>
        <Button
          :disabled="updateMutation.isPending.value"
          @click="saveSettings"
        >
          <Loader2
            v-if="updateMutation.isPending.value"
            class="mr-2 h-4 w-4 animate-spin"
          />
          <Save
            v-else
            class="mr-2 h-4 w-4"
          />
          {{ updateMutation.isPending.value ? 'Sauvegarde...' : 'Sauvegarder' }}
        </Button>
      </template>
    </AdminPageHeader>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="grid gap-6 lg:grid-cols-2"
    >
      <Skeleton class="h-80 rounded-xl" />
      <Skeleton class="h-80 rounded-xl" />
      <Skeleton class="h-80 rounded-xl" />
      <Skeleton class="h-80 rounded-xl" />
    </div>

    <div
      v-else
      class="grid gap-6 lg:grid-cols-2"
    >
      <!-- Store Information -->
      <div class="bg-card rounded-xl border p-6">
        <div class="mb-6 flex items-center gap-3">
          <div
            class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg"
          >
            <Store class="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 class="font-semibold">Informations boutique</h3>
            <p class="text-muted-foreground text-sm">Coordonnées et identité</p>
          </div>
        </div>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="store-name">Nom de la boutique</Label>
            <Input
              id="store-name"
              v-model="storeSettings.name"
            />
          </div>
          <div class="space-y-2">
            <Label for="store-email">Email de contact</Label>
            <Input
              id="store-email"
              v-model="storeSettings.email"
              type="email"
            />
          </div>
          <div class="space-y-2">
            <Label for="store-phone">Téléphone</Label>
            <Input
              id="store-phone"
              v-model="storeSettings.phone"
            />
          </div>
          <div class="space-y-2">
            <Label for="store-address">Adresse</Label>
            <Textarea
              id="store-address"
              v-model="storeSettings.address"
              rows="2"
            />
          </div>
        </div>
      </div>

      <!-- Regional Settings -->
      <div class="bg-card rounded-xl border p-6">
        <div class="mb-6 flex items-center gap-3">
          <div
            class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg"
          >
            <Globe class="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 class="font-semibold">Paramètres régionaux</h3>
            <p class="text-muted-foreground text-sm">
              Langue, devise et fuseau horaire
            </p>
          </div>
        </div>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="currency">Devise</Label>
            <Select v-model="storeSettings.currency">
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XOF">Franc CFA (XOF)</SelectItem>
                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                <SelectItem value="USD">Dollar US (USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="language">Langue</Label>
            <Select v-model="storeSettings.language">
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="timezone">Fuseau horaire</Label>
            <Select v-model="storeSettings.timezone">
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Abidjan">
                  Africa/Abidjan (GMT+0)
                </SelectItem>
                <SelectItem value="Europe/Paris">
                  Europe/Paris (GMT+1)
                </SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <!-- Shipping Settings -->
      <div class="bg-card rounded-xl border p-6">
        <div class="mb-6 flex items-center gap-3">
          <div
            class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg"
          >
            <Truck class="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 class="font-semibold">Livraison</h3>
            <p class="text-muted-foreground text-sm">Options de livraison</p>
          </div>
        </div>
        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="free-shipping">Seuil livraison gratuite (XOF)</Label>
            <Input
              id="free-shipping"
              v-model.number="shippingSettings.freeShippingThreshold"
              type="number"
            />
            <p class="text-muted-foreground text-xs">
              Livraison gratuite au-dessus de ce montant
            </p>
          </div>
          <div class="space-y-2">
            <Label for="default-shipping">
              Frais de livraison par défaut (XOF)
            </Label>
            <Input
              id="default-shipping"
              v-model.number="shippingSettings.defaultShippingCost"
              type="number"
            />
          </div>
          <div class="space-y-2">
            <Label for="delivery-days">Délai de livraison estimé</Label>
            <Input
              id="delivery-days"
              v-model="shippingSettings.estimatedDeliveryDays"
              placeholder="ex: 2-5 jours"
            />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <Label for="local-pickup">Retrait en magasin</Label>
              <p class="text-muted-foreground text-xs">
                Permettre le retrait sur place
              </p>
            </div>
            <Switch
              id="local-pickup"
              v-model:checked="shippingSettings.enableLocalPickup"
            />
          </div>
          <div
            v-if="shippingSettings.enableLocalPickup"
            class="space-y-2"
          >
            <Label for="pickup-address">Adresse de retrait</Label>
            <Textarea
              id="pickup-address"
              v-model="shippingSettings.localPickupAddress"
              rows="2"
            />
          </div>
        </div>
      </div>

      <!-- Payment Settings -->
      <div class="bg-card rounded-xl border p-6">
        <div class="mb-6 flex items-center gap-3">
          <div
            class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg"
          >
            <CreditCard class="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 class="font-semibold">Paiements</h3>
            <p class="text-muted-foreground text-sm">
              Méthodes de paiement acceptées
            </p>
          </div>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <Label>Paiement à la livraison</Label>
              <p class="text-muted-foreground text-xs">
                Cash on Delivery (COD)
              </p>
            </div>
            <Switch v-model:checked="paymentSettings.enableCOD" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <Label>Mobile Money</Label>
              <p class="text-muted-foreground text-xs">Orange, MTN, Wave</p>
            </div>
            <Switch v-model:checked="paymentSettings.enableMobileMoney" />
          </div>
          <div class="flex items-center justify-between">
            <div>
              <Label>Virement bancaire</Label>
              <p class="text-muted-foreground text-xs">Paiement par virement</p>
            </div>
            <Switch v-model:checked="paymentSettings.enableBankTransfer" />
          </div>
          <div
            v-if="paymentSettings.enableMobileMoney"
            class="pt-2"
          >
            <Label class="mb-2 block">Opérateurs Mobile Money</Label>
            <div class="flex flex-wrap gap-2">
              <Badge
                v-for="provider in paymentSettings.mobileMoneyProviders"
                :key="provider"
                variant="secondary"
              >
                {{ provider }}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class="bg-card rounded-xl border p-6 lg:col-span-2">
        <div class="mb-6 flex items-center gap-3">
          <div
            class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg"
          >
            <Bell class="text-primary h-5 w-5" />
          </div>
          <div>
            <h3 class="font-semibold">Notifications</h3>
            <p class="text-muted-foreground text-sm">
              Emails automatiques et alertes
            </p>
          </div>
        </div>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div class="space-y-4">
            <h4 class="flex items-center gap-2 text-sm font-medium">
              <Mail class="h-4 w-4" />
              Emails clients
            </h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <Label class="font-normal">Confirmation de commande</Label>
                <Switch
                  v-model:checked="notificationSettings.orderConfirmation"
                />
              </div>
              <div class="flex items-center justify-between">
                <Label class="font-normal">Commande expédiée</Label>
                <Switch v-model:checked="notificationSettings.orderShipped" />
              </div>
              <div class="flex items-center justify-between">
                <Label class="font-normal">Commande livrée</Label>
                <Switch v-model:checked="notificationSettings.orderDelivered" />
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <h4 class="flex items-center gap-2 text-sm font-medium">
              <Bell class="h-4 w-4" />
              Alertes admin
            </h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <Label class="font-normal">Alerte stock bas</Label>
                <Switch v-model:checked="notificationSettings.lowStockAlert" />
              </div>
              <div
                v-if="notificationSettings.lowStockAlert"
                class="space-y-2"
              >
                <Label
                  for="stock-threshold"
                  class="font-normal"
                >
                  Seuil d'alerte
                </Label>
                <Input
                  id="stock-threshold"
                  v-model.number="notificationSettings.lowStockThreshold"
                  type="number"
                  class="w-24"
                />
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <h4 class="flex items-center gap-2 text-sm font-medium">
              <Mail class="h-4 w-4" />
              Marketing
            </h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <Label class="font-normal">Newsletter</Label>
                <Switch
                  v-model:checked="notificationSettings.newsletterEnabled"
                />
              </div>
              <p class="text-muted-foreground text-xs">
                Permettre l'inscription à la newsletter
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
