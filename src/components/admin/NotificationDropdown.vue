<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  useNotifications,
  useNotificationsList,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from '@/composables/useNotifications'
import { getNotificationColor } from '@/services/notification.service'
import type { Notification } from '@/services/notification.service'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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
} from 'lucide-vue-next'

// Initialize socket connection
useNotifications()

const router = useRouter()
const { notifications, isLoading } = useNotificationsList({ limit: 10 })
const { unreadCount } = useUnreadCount()
const markAsReadMutation = useMarkAsRead()
const markAllAsReadMutation = useMarkAllAsRead()

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

const getIcon = (type: string) => {
  return iconMap[type] || Bell
}

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR')
}

const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.isRead) {
    await markAsReadMutation.mutateAsync(notification.id)
  }

  // Navigate based on notification type
  const data = notification.data as Record<string, string> | null
  if (data?.orderId) {
    router.push(`/admin/orders/${data.orderId}`)
  } else if (data?.productId) {
    router.push(`/admin/products/${data.productId}/edit`)
  }
}

const handleMarkAllAsRead = async () => {
  await markAllAsReadMutation.mutateAsync()
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="relative"
      >
        <Bell class="size-5" />
        <span
          v-if="unreadCount > 0"
          class="bg-destructive absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-medium text-white"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-80"
      align="end"
      :side-offset="8"
    >
      <DropdownMenuLabel class="flex items-center justify-between">
        <span>Notifications</span>
        <Button
          v-if="unreadCount > 0"
          variant="ghost"
          size="sm"
          class="text-muted-foreground hover:text-foreground h-auto p-1 text-xs"
          @click.stop="handleMarkAllAsRead"
          :disabled="markAllAsReadMutation.isPending.value"
        >
          <Check class="mr-1 size-3" />
          Tout marquer comme lu
        </Button>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <ScrollArea class="h-[300px]">
        <div
          v-if="isLoading"
          class="flex items-center justify-center py-8"
        >
          <div
            class="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent"
          />
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="text-muted-foreground py-8 text-center"
        >
          <Bell class="mx-auto mb-2 size-8 opacity-50" />
          <p class="text-sm">Aucune notification</p>
        </div>

        <template v-else>
          <DropdownMenuItem
            v-for="notification in notifications"
            :key="notification.id"
            class="flex cursor-pointer items-start gap-3 p-3"
            :class="{ 'bg-muted/50': !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div
              class="bg-muted mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full"
              :class="getNotificationColor(notification.type)"
            >
              <component
                :is="getIcon(notification.type)"
                class="size-4"
              />
            </div>
            <div class="flex-1 space-y-1">
              <p
                class="text-sm leading-tight font-medium"
                :class="{ 'font-semibold': !notification.isRead }"
              >
                {{ notification.title }}
              </p>
              <p class="text-muted-foreground line-clamp-2 text-xs">
                {{ notification.message }}
              </p>
              <p class="text-muted-foreground/70 text-xs">
                {{ formatTime(notification.createdAt) }}
              </p>
            </div>
            <div
              v-if="!notification.isRead"
              class="bg-primary mt-1 size-2 shrink-0 rounded-full"
            />
          </DropdownMenuItem>
        </template>
      </ScrollArea>

      <DropdownMenuSeparator v-if="notifications.length > 0" />
      <DropdownMenuItem
        v-if="notifications.length > 0"
        class="text-muted-foreground justify-center text-sm"
        as-child
      >
        <RouterLink to="/admin/notifications">
          Voir toutes les notifications
        </RouterLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
