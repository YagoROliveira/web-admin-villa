/**
 * Tipos para gestão de lotes de pagamento a fornecedores
 */

export type PaymentBatchStatus = 'draft' | 'pending_approval' | 'approved' | 'processing' | 'paid' | 'failed' | 'cancelled'

export type PaymentItemType = 'order' | 'adjustment' | 'bonus' | 'discount' | 'other'

/**
 * Item individual dentro de um lote de pagamento
 */
export interface PaymentItem {
  id?: number
  type: PaymentItemType
  reference_id?: string // ID do pedido se type = 'order'
  description: string
  amount: number
  notes?: string
  created_at?: string
}

/**
 * Comprovante de pagamento
 */
export interface PaymentProof {
  id?: number
  file_name: string
  file_url: string
  file_path?: string
  file_type: string
  file_size?: number
  uploaded_at?: string
  uploaded_by?: string
}

/**
 * Evento da timeline de pagamento
 */
export interface PaymentTimelineEvent {
  id?: number
  status: PaymentBatchStatus
  old_status?: string
  new_status?: string
  description: string
  created_at: string
  created_by?: string
  user_name?: string
  notes?: string
}

/**
 * Lote de pagamento completo
 */
export interface PaymentBatch {
  id?: number
  store_id: number
  store_name?: string

  // Período
  period_type: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'annual' | 'custom'
  start_date: string // 'YYYY-MM-DD'
  end_date: string // 'YYYY-MM-DD'

  // Status
  status: PaymentBatchStatus

  // Valores
  items: PaymentItem[]
  total_amount: number

  // Comprovantes
  proofs: PaymentProof[]

  // Timeline
  timeline: PaymentTimelineEvent[]

  // Metadados
  created_at?: string
  updated_at?: string
  created_by?: string
  approved_by?: string
  paid_at?: string

  // Observações
  notes?: string
}

/**
 * Request para criar/atualizar lote de pagamento
 */
export interface CreatePaymentBatchRequest {
  store_id: number
  period_type: string
  start_date: string
  end_date: string
  items: Omit<PaymentItem, 'id' | 'created_at'>[]
  notes?: string
}

/**
 * Request para atualizar status do lote
 */
export interface UpdatePaymentBatchStatusRequest {
  status: PaymentBatchStatus
  notes?: string
}

/**
 * Request para adicionar comprovante
 */
export interface AddPaymentProofRequest {
  file: File
  notes?: string
}

/**
 * Resumo para listagem
 */
export interface PaymentBatchSummary {
  id: number
  store_id: number
  store_name: string
  period_type: string
  start_date: string
  end_date: string
  status: PaymentBatchStatus
  total_amount: number
  items_count: number
  created_at: string
  paid_at?: string
}
