// Enums
export enum CashbackStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

export enum CashbackType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  PROMOTIONAL = 'PROMOTIONAL',
  LOYALTY = 'LOYALTY',
}

export enum AuditAction {
  CREATE = 'CREATE',
  PROCESS_START = 'PROCESS_START',
  CREDIT_SUCCESS = 'CREDIT_SUCCESS',
  CREDIT_FAILED = 'CREDIT_FAILED',
  RETRY_ATTEMPT = 'RETRY_ATTEMPT',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

// Interfaces
export interface Cashback {
  id: number
  orderId: string
  userId: string
  userName?: string
  cashbackType: CashbackType
  orderAmountCents: number
  orderAmountReais?: number
  cashbackPercentage?: number
  cashbackAmountCents: number
  cashbackAmountReais?: number
  status: CashbackStatus
  walletTransactionId?: string
  idempotencyKey?: string
  processedAt?: string
  failedAt?: string
  failureReason?: string
  retryCount: number
  notificationSent: boolean
  notificationSentAt?: string
  campaignId?: string
  metadata?: Record<string, any>
  reversedAt?: string
  reversalReason?: string
  createdAt: string
  updatedAt: string
}

export interface CashbackAuditLog {
  id: number
  cashbackId: number
  previousStatus?: string
  newStatus: string
  action: AuditAction
  details?: Record<string, any>
  performedBy?: string
  ipAddress?: string
  createdAt: string
}

// API Request Types
export interface ProcessCashbackRequest {
  orderId: string
  userId: string
  orderAmountCents: number
  cashbackPercentage?: number
  cashbackType?: CashbackType
  campaignId?: string
  metadata?: Record<string, any>
}

export interface CreateCashbackRequest {
  orderId: string
  userId: string
  orderAmountCents: number
  cashbackPercentage?: number
  cashbackType?: CashbackType
  campaignId?: string
  metadata?: Record<string, any>
}

export interface ProcessPendingRequest {
  limit?: number
}

export interface RetryFailedRequest {
  maxRetries?: number
  limit?: number
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  error?: string
  data?: T
  isDuplicate?: boolean
  cashbackId?: number
  count?: number
}

export interface ProcessCashbackResponse {
  cashbackId: number
  cashbackAmountCents: number
  cashbackAmountReais: number
  walletTransactionId?: string
}

export interface CashbackStats {
  total: number
  pending: number
  completed: number
  failed: number
  cancelled?: number
  totalAmountCents: number
  totalAmountReais: number
}

export interface CashbackListResponse {
  cashbacks: Cashback[]
  total: number
  limit: number
  offset: number
}

export interface CashbackFilters {
  status?: CashbackStatus
  userId?: string
  startDate?: string
  endDate?: string
  campaignId?: string
  minAmount?: number
  maxAmount?: number
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  totalItems?: number
}

// Worker types
export interface RunWorkerRequest {
  batchSize?: number
}

export interface RunWorkerDateRangeRequest {
  startDate: string
  endDate: string
  batchSize?: number
}

export interface WorkerRunResponse {
  processedCount: number
  skippedCount: number
  failedCount: number
  totalOrders: number
  executionTime: string
}

export interface WorkerStats {
  lastRun?: string
  totalRuns: number
  totalProcessed: number
  averageExecutionTime?: string
}
