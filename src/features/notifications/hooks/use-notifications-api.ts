import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import villamarketApi from '@/lib/villamarket-api'
import { useAuthStore } from '@/stores/auth-store'
import type {
  Notification,
  UserNotificationsResponse,
  SendNotificationRequest,
  SendBulkNotificationRequest,
  SendTopicNotificationRequest,
} from '../types'

// ─── Query Keys ───

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  user: (userId: string) => [...notificationKeys.all, 'user', userId] as const,
}

// ─── Queries ───

/** Admin: list all notifications (paginated) */
export function useNotifications(
  params?: { page?: number; limit?: number; type?: string },
  options?: Partial<UseQueryOptions<UserNotificationsResponse>>,
) {
  return useQuery<UserNotificationsResponse>({
    queryKey: [...notificationKeys.list(), params],
    queryFn: async () => {
      const { data } = await villamarketApi.get('/v1/notifications', { params })
      return data
    },
    staleTime: 30_000,
    ...options,
  })
}

/** Get current user's notifications */
export function useUserNotifications(
  params?: { page?: number; limit?: number },
  options?: Partial<UseQueryOptions<UserNotificationsResponse>>,
) {
  const { auth } = useAuthStore()
  const userId = auth.user?.id

  return useQuery<UserNotificationsResponse>({
    queryKey: [...notificationKeys.user(userId ?? ''), params],
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        `/v1/notifications/user/${userId}`,
        { params },
      )
      return data
    },
    enabled: !!userId,
    staleTime: 15_000,
    refetchInterval: 60_000, // Poll every 60s for new notifications
    ...options,
  })
}

// ─── Mutations ───

export function useSendNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (req: SendNotificationRequest) => {
      const { data } = await villamarketApi.post('/v1/notifications/send', req)
      return data as Notification
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useSendBulkNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (req: SendBulkNotificationRequest) => {
      const { data } = await villamarketApi.post(
        '/v1/notifications/send-bulk',
        req,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useSendTopicNotification() {
  return useMutation({
    mutationFn: async (req: SendTopicNotificationRequest) => {
      const { data } = await villamarketApi.post(
        '/v1/notifications/send-to-topic',
        req,
      )
      return data
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await villamarketApi.patch(
        `/v1/notifications/${notificationId}/read`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const { auth } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      const userId = auth.user?.id
      if (!userId) throw new Error('User ID not found')
      const { data } = await villamarketApi.patch(
        `/v1/notifications/user/${userId}/read-all`,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await villamarketApi.delete(`/v1/notifications/${notificationId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
