import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  notificationService,
  type Notification,
  type NotificationFilters,
} from '@/services/notification.service'
import { useAuth } from './useAuth'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'

export const useNotifications = () => {
  const queryClient = useQueryClient()
  const { user, isAuthenticated } = useAuth()
  const socket = ref<Socket | null>(null)

  // Connect to socket for real-time notifications
  const connectSocket = () => {
    if (!isAuthenticated.value || !user.value) return

    socket.value = io(SOCKET_URL, {
      transports: ['websocket'],
    })

    socket.value.on('connect', () => {
      // Join user room for notifications
      socket.value?.emit('join-user', user.value?.id)

      // Join admin room if user is admin
      if (user.value?.role === 'ADMIN') {
        socket.value?.emit('join-admin')
      }
    })

    // Listen for new notifications
    socket.value.on('notification:new', (notification: Notification) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread-count'],
      })
    })
  }

  const disconnectSocket = () => {
    if (socket.value) {
      if (user.value) {
        socket.value.emit('leave-user', user.value.id)
        if (user.value.role === 'ADMIN') {
          socket.value.emit('leave-admin')
        }
      }
      socket.value.disconnect()
      socket.value = null
    }
  }

  onMounted(() => {
    if (isAuthenticated.value) {
      connectSocket()
    }
  })

  onUnmounted(() => {
    disconnectSocket()
  })

  return {
    connectSocket,
    disconnectSocket,
  }
}

export const useNotificationsList = (filters?: NotificationFilters) => {
  const { isAuthenticated } = useAuth()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationService.getNotifications(filters),
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  })

  const notifications = computed(() => data.value?.data || [])
  const pagination = computed(() => data.value?.meta)

  return {
    notifications,
    pagination,
    isLoading,
    error,
    refetch,
  }
}

export const useUnreadCount = () => {
  const { isAuthenticated } = useAuth()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refresh every minute
  })

  const unreadCount = computed(() => data.value?.count || 0)

  return {
    unreadCount,
    isLoading,
    refetch,
  }
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread-count'],
      })
    },
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread-count'],
      })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({
        queryKey: ['notifications-unread-count'],
      })
    },
  })
}
