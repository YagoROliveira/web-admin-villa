/**
 * Analytics types matching the villamarket-api Mongoose schemas.
 */

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_started'
  | 'purchase'
  | 'search'
  | 'store_view'
  | 'category_view'
  | 'promotion_view'
  | 'promotion_click'
  | 'review_submitted'
  | 'app_open'
  | 'app_close'
  | 'notification_received'
  | 'notification_clicked'
  | 'share'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'delivery_tracking_view'
  | 'support_chat_opened'
  | 'custom'

export type DailyMetricType =
  | 'orders_count'
  | 'orders_revenue'
  | 'orders_average_value'
  | 'products_sold'
  | 'new_customers'
  | 'returning_customers'
  | 'store_views'
  | 'product_views'
  | 'conversion_rate'
  | 'cart_abandonment_rate'
  | 'average_delivery_time'
  | 'reviews_count'
  | 'reviews_average_rating'
  | 'revenue_per_customer'

export interface AnalyticsEvent {
  _id: string
  timestamp: string
  eventType: AnalyticsEventType
  userId?: string
  storeId?: string
  sessionId?: string
  properties?: Record<string, unknown>
  device?: Record<string, unknown>
  geo?: Record<string, unknown>
}

export interface DailyMetric {
  _id: string
  date: string
  storeId: string
  metric: DailyMetricType
  value: number
  breakdown?: Record<string, unknown>
}

export interface TrackEventRequest {
  eventType: AnalyticsEventType
  userId?: string
  storeId?: string
  sessionId?: string
  properties?: Record<string, unknown>
}

export interface StoreDashboardResponse {
  eventCounts: Record<string, number>
  dailyMetrics: DailyMetric[]
}

export interface StoreMetricsParams {
  startDate?: string
  endDate?: string
  metrics?: DailyMetricType[]
}
