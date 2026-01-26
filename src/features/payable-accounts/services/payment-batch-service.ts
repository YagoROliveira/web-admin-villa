/**
 * Serviço de API para gerenciamento de lotes de pagamento
 */

import { API_CONFIG } from '@/config/api'
import type {
  PaymentBatch,
  PaymentBatchSummary,
  CreatePaymentBatchRequest,
  UpdatePaymentBatchStatusRequest,
  PaymentProof,
} from '../types/payment-batch'

const BASE_URL = `${API_CONFIG.BASE_URL}/admin/stores`

interface ListBatchesResponse {
  batches: PaymentBatchSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
  stats: {
    total_batches: number
    paid_count: number
    pending_count: number
    total_amount_paid: number
  }
}

export const paymentBatchService = {
  /**
   * Listar lotes de pagamento de uma loja
   */
  async listPaymentBatches(storeId: number): Promise<PaymentBatchSummary[]> {
    const url = `${BASE_URL}/${storeId}/payment-batches`
    console.log('[Payment Batch] Fetching batches from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Payment Batch] List error:', errorText)
      throw new Error('Erro ao listar lotes de pagamento')
    }

    const result: ListBatchesResponse = await response.json()
    return result.batches
  },

  /**
   * Buscar detalhes de um lote específico
   */
  async getPaymentBatch(storeId: number, batchId: number): Promise<PaymentBatch> {
    const url = `${BASE_URL}/${storeId}/payment-batches/${batchId}`
    console.log('[Payment Batch] Fetching batch from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Payment Batch] Get error:', errorText)
      throw new Error('Erro ao buscar lote de pagamento')
    }

    const batch: PaymentBatch = await response.json()
    return batch
  },

  /**
   * Criar novo lote de pagamento
   */
  async createPaymentBatch(
    storeId: number,
    data: CreatePaymentBatchRequest
  ): Promise<PaymentBatch> {
    const url = `${BASE_URL}/${storeId}/payment-batches`
    console.log('[Payment Batch] Creating batch:', url, data)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Payment Batch] Create error:', errorText)
      throw new Error('Erro ao criar lote de pagamento')
    }

    const batch: PaymentBatch = await response.json()
    return batch
  },

  /**
   * Atualizar lote de pagamento
   */
  async updatePaymentBatch(
    storeId: number,
    batchId: number,
    data: Partial<CreatePaymentBatchRequest>
  ): Promise<PaymentBatch> {
    const url = `${BASE_URL}/${storeId}/payment-batches/${batchId}`
    console.log('[Payment Batch] Updating batch:', url, data)

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Payment Batch] Update error:', errorText)
      throw new Error('Erro ao atualizar lote de pagamento')
    }

    const batch: PaymentBatch = await response.json()
    return batch
  },

  /**
   * Atualizar status do lote
   */
  async updateBatchStatus(
    storeId: number,
    batchId: number,
    data: UpdatePaymentBatchStatusRequest
  ): Promise<PaymentBatch> {
    const url = `${BASE_URL}/${storeId}/payment-batches/${batchId}/status`
    console.log('[Payment Batch] Updating status:', url, data)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Payment Batch] Status update error:', errorText)
      throw new Error('Erro ao atualizar status do lote')
    }

    const result = await response.json()
    return result
  },

  /**
   * Upload de comprovante de pagamento
   */
  async uploadPaymentProof(
    storeId: number,
    batchId: number,
    file: File,
    notes?: string
  ): Promise<PaymentProof> {
    const url = `${BASE_URL}/${storeId}/payment-batches/${batchId}/proofs`
    console.log('[Payment Batch] Uploading proof:', url)

    const formData = new FormData()
    formData.append('file', file)
    if (notes) {
      formData.append('notes', notes)
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Payment Batch] Upload proof error:', errorText)
      throw new Error('Erro ao fazer upload do comprovante')
    }

    const proof: PaymentProof = await response.json()
    return proof
  },

  /**
   * Deletar comprovante
   */
  async deletePaymentProof(
    storeId: number,
    batchId: number,
    proofId: number
  ): Promise<void> {
    const url = `${BASE_URL}/${storeId}/payment-batches/${batchId}/proofs/${proofId}`
    console.log('[Payment Batch] Deleting proof:', url)

    const response = await fetch(url, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Payment Batch] Delete proof error:', errorText)
      throw new Error('Erro ao deletar comprovante')
    }
  },

  /**
   * Deletar lote de pagamento
   */
  async deletePaymentBatch(storeId: number, batchId: number): Promise<void> {
    const url = `${BASE_URL}/${storeId}/payment-batches/${batchId}`
    console.log('[Payment Batch] Deleting batch:', url)

    const response = await fetch(url, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Payment Batch] Delete batch error:', errorText)
      throw new Error('Erro ao deletar lote de pagamento')
    }
  },
}
