/**
 * Notification types matching the villamarket-api Mongoose schema.
 */

export type NotificationType =
  | 'order_placed'
  | 'order_accepted'
  | 'order_preparing'
  | 'order_ready'
  | 'order_picked_up'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_refunded'
  | 'payment_received'
  | 'payment_failed'
  | 'new_message'
  | 'new_review'
  | 'store_approved'
  | 'store_suspended'
  | 'delivery_assigned'
  | 'delivery_nearby'
  | 'promotion_started'
  | 'subscription_expiring'
  | 'withdrawal_processed'
  | 'system_announcement'
  | 'custom'

export type NotificationChannel = 'push' | 'in_app' | 'email' | 'sms'

export type RecipientType =
  | 'customer'
  | 'vendor'
  | 'admin'
  | 'delivery_man'

export interface NotificationData {
  entityType?: string
  entityId?: string
  actionUrl?: string
  [key: string]: unknown
}

export interface Notification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  imageUrl?: string
  read: boolean
  readAt?: string
  data?: NotificationData
  storeId?: string
  recipientType?: RecipientType
  channels: NotificationChannel[]
  sent: boolean
  pushResult?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface SendNotificationRequest {
  userId: string
  type: NotificationType
  title: string
  body: string
  imageUrl?: string
  data?: NotificationData
  storeId?: string
  recipientType?: RecipientType
  channels?: NotificationChannel[]
}

export interface SendBulkNotificationRequest {
  notifications: SendNotificationRequest[]
}

export interface SendTopicNotificationRequest {
  topic: string
  title: string
  body: string
  imageUrl?: string
  data?: NotificationData
}

export interface UserNotificationsResponse {
  data: Notification[]
  unreadCount: number
  total: number
  page: number
  limit: number
}
