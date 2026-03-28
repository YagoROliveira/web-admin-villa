/**
 * Audit Log types matching the villamarket-api Mongoose schema.
 */

export type AuditAction =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'activate'
  | 'deactivate'
  | 'assign'
  | 'unassign'
  | 'payment_process'
  | 'refund'
  | 'role_change'
  | 'permission_change'
  | 'config_change'
  | 'bulk_action'
  | 'api_call'
  | 'file_upload'
  | 'file_delete'

export type AuditUserRole =
  | 'super_admin'
  | 'admin'
  | 'vendor'
  | 'vendor_employee'
  | 'customer'
  | 'delivery_man'
  | 'system'

export type AuditStatus = 'success' | 'failure' | 'partial'

export interface AuditMetadata {
  ip?: string
  userAgent?: string
  requestId?: string
  [key: string]: unknown
}

export interface AuditLog {
  _id: string
  userId: string
  userName?: string
  userRole: AuditUserRole
  action: AuditAction
  entityType: string
  entityId?: string
  entityName?: string
  storeId?: string
  description?: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  changedFields?: string[]
  metadata?: AuditMetadata
  timestamp: string
  status: AuditStatus
  createdAt: string
}

export interface AuditQueryParams {
  page?: number
  limit?: number
  userId?: string
  action?: AuditAction
  entityType?: string
  storeId?: string
  startDate?: string
  endDate?: string
  status?: AuditStatus
}

export interface PaginatedAuditResponse {
  data: AuditLog[]
  total: number
  page: number
  limit: number
}
