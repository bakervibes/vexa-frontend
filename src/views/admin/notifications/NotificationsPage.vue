<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  useNotificationsList,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '@/composables/useNotifications'
import { getNotificationColor } from '@/services/notification.service'
import type {
  Notification,
  NotificationType,
} from '@/services/notification.service'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bell,
  ShoppingCart,
  CheckCircle,
  Truck,
  PackageCheck,
  XCircle,
  RotateCcw,
  AlertTriangle,
  AlertOctagon,
  PackagePlus,
  CreditCard,
  Star,
  MessageCircle,
  Megaphone,
  User,
  Sparkles,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
} from 'lucide-vue-next'

const router = useRouter()
const page = ref(1)
const filterType = ref<NotificationType | 'all'>('all')
const filterRead = ref<'all' | 'read' | 'unread'>('all')

const filters = computed(() => ({
  page: page.value,
  limit: 20,
  type: filterType.value !== 'all' ? filterType.value : undefined,
  isRead: filterRead.value === 'all' ? undefined : filterRead.value === 'read',
}))

const { notifications, pagination, isLoading, refetch } = useNotificationsList(
  filters.value,
)
const { unreadCount } = useUnreadCount()
const markAsReadMutation = useMarkAsRead()
const markAllAsReadMutation = useMarkAllAsRead()
const deleteMutation = useDeleteNotification()

// Watch filters and refetch
watch([filterType, filterRead], () => {
  page.value = 1
  refetch()
})

watch(page, () => {
  refetch()
})

const iconMap: Record<string, any> = {
  ORDER_PLACED: ShoppingCart,
  ORDER_CONFIRMED: CheckCircle,
  ORDER_SHIPPED: Truck,
  ORDER_DELIVERED: PackageCheck,
  ORDER_CANCELLED: XCircle,
  ORDER_REFUNDED: RotateCcw,
  LOW_STOCK_ALERT: AlertTriangle,
  OUT_OF_STOCK_ALERT: AlertOctagon,
  STOCK_REPLENISHED: PackagePlus,
  PAYMENT_RECEIVED: CreditCard,
  PAYMENT_FAILED: CreditCard,
  NEW_REVIEW: Star,
  REVIEW_RESPONSE: MessageCircle,
  SYSTEM_ANNOUNCEMENT: Megaphone,
  ACCOUNT_UPDATE: User,
  WELCOME: Sparkles,
}

const typeLabels: Record<string, string> = {
  ORDER_PLACED: 'Commande passée',
  ORDER_CONFIRMED: 'Commande confirmée',
  ORDER_SHIPPED: 'Commande expédiée',
  ORDER_DELIVERED: 'Commande livrée',
  ORDER_CANCELLED: 'Commande annulée',
  ORDER_REFUNDED: 'Remboursement',
  LOW_STOCK_ALERT: 'Stock bas',
  OUT_OF_STOCK_ALERT: 'Rupture de stock',
  STOCK_REPLENISHED: 'Stock réapprovisionné',
  PAYMENT_RECEIVED: 'Paiement reçu',
  PAYMENT_FAILED: 'Paiement échoué',
  NEW_REVIEW: 'Nouvel avis',
  REVIEW_RESPONSE: 'Réponse avis',
  SYSTEM_ANNOUNCEMENT: 'Annonce système',
  ACCOUNT_UPDATE: 'Mise à jour compte',
  WELCOME: 'Bienvenue',
}

const getIcon = (type: string) => iconMap[type] || Bell

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.isRead) {
    await markAsReadMutation.mutateAsync(notification.id)
  }

  const data = notification.data as Record<string, string> | null
  if (data?.orderId) {
    router.push(`/admin/orders/${data.orderId}`)
  } else if (data?.productId) {
    router.push(`/admin/products/${data.productId}/edit`)
  }
}

const handleMarkAsRead = async (id: string, event: Event) => {
  event.stopPropagation()
  await markAsReadMutation.mutateAsync(id)
}

const handleDelete = async (id: string, event: Event) => {
  event.stopPropagation()
  await deleteMutation.mutateAsync(id)
}

const handleMarkAllAsRead = async () => {
  await markAllAsReadMutation.mutateAsync()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Notifications</h1>
        <p class="text-muted-foreground">
          {{ unreadCount }} notification{{ unreadCount > 1 ? 's' : '' }} non
          lue{{ unreadCount > 1 ? 's' : '' }}
        </p>
      </div>
      <Button
        v-if="unreadCount > 0"
        variant="outline"
        @click="handleMarkAllAsRead"
        :disabled="markAllAsReadMutation.isPending.value"
      >
        <CheckCheck class="mr-2 size-4" />
        Tout marquer comme lu
      </Button>
    </div>

    <!-- Filters -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center gap-2">
            <Filter class="text-muted-foreground size-4" />
            <span class="text-sm font-medium">Filtres:</span>
          </div>

          <Select v-model="filterType">
            <SelectTrigger class="w-[200px]">
              <SelectValue placeholder="Type de notification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem
                v-for="(label, key) in typeLabels"
                :key="key"
                :value="key"
              >
                {{ label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="filterRead">
            <SelectTrigger class="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="unread">Non lues</SelectItem>
              <SelectItem value="read">Lues</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Notifications List -->
    <Card>
      <CardContent class="p-0">
        <div
          v-if="isLoading"
          class="flex items-center justify-center py-12"
        >
          <div
            class="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent"
          />
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="py-12 text-center"
        >
          <Bell class="text-muted-foreground/50 mx-auto mb-4 size-12" />
          <p class="text-muted-foreground text-lg font-medium">
            Aucune notification
          </p>
          <p class="text-muted-foreground/70 text-sm">
            Vous n'avez pas encore de notifications
          </p>
        </div>

        <div
          v-else
          class="divide-y"
        >
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="hover:bg-muted/50 flex cursor-pointer items-start gap-4 p-4 transition-colors"
            :class="{ 'bg-muted/30': !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <!-- Icon -->
            <div
              class="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full"
              :class="getNotificationColor(notification.type)"
            >
              <component
                :is="getIcon(notification.type)"
                class="size-5"
              />
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p
                    class="font-medium"
                    :class="{ 'font-semibold': !notification.isRead }"
                  >
                    {{ notification.title }}
                  </p>
                  <p class="text-muted-foreground mt-1 text-sm">
                    {{ notification.message }}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  class="shrink-0"
                >
                  {{ typeLabels[notification.type] || notification.type }}
                </Badge>
              </div>
              <p class="text-muted-foreground mt-2 text-xs">
                {{ formatDate(notification.createdAt) }}
              </p>
            </div>

            <!-- Actions -->
            <div class="flex shrink-0 items-center gap-1">
              <Button
                v-if="!notification.isRead"
                variant="ghost"
                size="icon"
                class="size-8"
                @click="handleMarkAsRead(notification.id, $event)"
                :disabled="markAsReadMutation.isPending.value"
              >
                <Check class="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="text-muted-foreground hover:text-destructive size-8"
                @click="handleDelete(notification.id, $event)"
                :disabled="deleteMutation.isPending.value"
              >
                <Trash2 class="size-4" />
              </Button>
            </div>

            <!-- Unread indicator -->
            <div
              v-if="!notification.isRead"
              class="bg-primary mt-2 size-2 shrink-0 rounded-full"
            />
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination && pagination.totalPages > 1"
          class="flex items-center justify-between border-t px-4 py-3"
        >
          <p class="text-muted-foreground text-sm">
            Page {{ pagination.page }} sur {{ pagination.totalPages }} ({{
              pagination.total
            }}
            notifications)
          </p>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="page === 1"
              @click="page--"
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              :disabled="page >= pagination.totalPages"
              @click="page++"
            >
              Suivant
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
