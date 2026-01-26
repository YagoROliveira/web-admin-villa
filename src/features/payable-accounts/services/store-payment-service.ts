/**
 * Serviço de API para Gestão de Pagamentos de Fornecedores
 * API Base: https://prod.villamarket.app/admin/stores
 */

import { API_CONFIG } from '@/config/api'
import type {
  Store,
  PaymentReport,
  PaymentReportFilters,
  ConsolidatedReport,
  TransferResponse,
  OrderWithCosts,
} from '../types'

const BASE_URL = `${API_CONFIG.BASE_URL}/admin/stores`

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface ListResponse<T> {
  success: boolean
  count: number
  data: T[]
}

export const storePaymentService = {
  /**
   * Listar todas as lojas ativas
   */
  async listStores(): Promise<Store[]> {
    const url = `${BASE_URL}`
    console.log('[Store Payment] Fetching stores from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      console.error('[Store Payment] Stores error:', response.status, response.statusText)
      throw new Error('Erro ao listar lojas')
    }

    const result: ListResponse<Store> = await response.json()

    if (!result.success) {
      throw new Error('Erro ao listar lojas')
    }

    return result.data
  },

  /**
   * Buscar detalhes de uma loja específica
   */
  async getStore(storeId: number): Promise<Store> {
    const url = `${BASE_URL}/${storeId}`
    console.log('[Store Payment] Fetching store from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Erro ao buscar loja')
    }

    const result: ApiResponse<Store> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Loja não encontrada')
    }

    return result.data
  },

  /**
   * Gerar relatório de pagamento de uma loja específica
   */
  async getStorePaymentReport(
    storeId: number,
    filters: PaymentReportFilters
  ): Promise<PaymentReport> {
    const url = `${BASE_URL}/${storeId}/payment-report`
    console.log('[Store Payment] Generating report from:', url, filters)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Store Payment] Report error:', response.status, response.statusText)
      console.error('[Store Payment] Error body:', errorText)

      let errorMessage = 'Erro ao gerar relatório'
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    const result: ApiResponse<PaymentReport> = await response.json()
    console.log('[Store Payment] Report response:', result)

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao gerar relatório')
    }

    return result.data
  },

  /**
   * Gerar relatório consolidado de todas as lojas
   */
  async getAllStoresPaymentReport(
    filters: PaymentReportFilters
  ): Promise<ConsolidatedReport> {
    const url = `${BASE_URL}/payment-reports`
    console.log('[Store Payment] Generating consolidated report from:', url, filters)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Store Payment] Consolidated report error:', response.status, response.statusText, errorText)
      throw new Error(`Erro ao gerar relatório consolidado: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log('[Store Payment] Consolidated report response:', result)

    if (!result.success) {
      throw new Error(result.message || 'Erro ao gerar relatório consolidado')
    }

    // A API pode retornar os dados diretamente ou dentro de 'data'
    return result.data || result
  },

  /**
   * Processar repasse de pagamento
   */
  async processPaymentTransfer(
    storeId: number,
    filters: PaymentReportFilters
  ): Promise<TransferResponse> {
    const url = `${BASE_URL}/${storeId}/payment-transfer`
    console.log('[Store Payment] Processing transfer from:', url, filters)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    })

    if (!response.ok) {
      console.error('[Store Payment] Transfer error:', response.status, response.statusText)
      throw new Error('Erro ao processar repasse')
    }

    const result: ApiResponse<TransferResponse> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao processar repasse')
    }

    return result.data
  },

  /**
   * Listar pedidos com custos detalhados de uma loja específica
   */
  async getOrdersWithCosts(filters: PaymentReportFilters): Promise<{
    orders: OrderWithCosts[]
    count: number
  }> {
    // store_id deve estar nos filtros
    if (!filters.store_id) {
      throw new Error('store_id é obrigatório')
    }

    // Usar o endpoint correto: /admin/stores/:storeId/orders
    const url = new URL(`${BASE_URL}/${filters.store_id}/orders`)

    // Adicionar outros parâmetros (exceto store_id que já está na URL)
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'store_id' && value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    console.log('[Store Payment] Fetching orders from:', url.toString())
    console.log('[Store Payment] Filters:', filters)

    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Store Payment] Orders error:', response.status, response.statusText, errorText)
      throw new Error(`Erro ao listar pedidos: ${response.status} - ${errorText}`)
    }

    const result: ListResponse<OrderWithCosts> = await response.json()
    console.log('[Store Payment] Orders response:', result)

    if (!result.success) {
      throw new Error(result.message || 'Erro ao listar pedidos')
    }

    return {
      orders: result.data || [],
      count: result.count || 0,
    }
  },

  /**
   * Listar pedidos de uma loja específica (simplificado)
   */
  async getStoreOrders(
    storeId: number,
    filters: {
      start_date?: string
      end_date?: string
      payment_status?: string
    }
  ): Promise<OrderWithCosts[]> {
    const url = new URL(`${BASE_URL}/${storeId}/orders`)

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value)
      }
    })

    console.log('[Store Payment] Fetching store orders from:', url.toString())

    const response = await fetch(url)

    if (!response.ok) {
      console.error('[Store Payment] Store orders error:', response.status, response.statusText)
      throw new Error('Erro ao listar pedidos da loja')
    }

    const result: ListResponse<OrderWithCosts> = await response.json()

    if (!result.success) {
      throw new Error('Erro ao listar pedidos da loja')
    }

    return result.data
  },
}
