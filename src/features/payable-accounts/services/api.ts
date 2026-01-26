/**
 * Serviço de API para Contas a Pagar
 */

import { API_CONFIG } from '@/config/api'
import type {
  PayableAccount,
  PayableAccountFilters,
  CreatePayableAccountRequest,
  PayableAccountSummary,
  DashboardMetrics,
} from '../types'

const API_BASE_URL = API_CONFIG.BASE_URL

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

interface ListResponse<T> {
  success: boolean
  total: number
  limit: number
  offset: number
  data: T[]
  summary?: PayableAccountSummary
}

export const payableAccountService = {
  /**
   * Buscar dashboard completo
   */
  async getDashboard(): Promise<DashboardMetrics> {
    const url = `${API_BASE_URL}/admin/payable-accounts/dashboard`
    console.log('[Payable Accounts] Fetching dashboard from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      console.error('[Payable Accounts] Dashboard error:', response.status, response.statusText)
      throw new Error('Erro ao buscar dashboard')
    }

    const result: ApiResponse<DashboardMetrics> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao buscar dashboard')
    }

    return result.data
  },

  /**
   * Listar contas com filtros
   */
  async listAccounts(
    filters: PayableAccountFilters
  ): Promise<{ accounts: PayableAccount[]; total: number; summary?: PayableAccountSummary }> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const url = `${API_BASE_URL}/admin/payable-accounts?${params.toString()}`
    console.log('[Payable Accounts] Fetching list from:', url)

    const response = await fetch(url)

    if (!response.ok) {
      console.error('[Payable Accounts] List error:', response.status, response.statusText)
      throw new Error('Erro ao listar contas')
    }

    const result: ListResponse<PayableAccount> = await response.json()

    if (!result.success) {
      throw new Error('Erro ao listar contas')
    }

    return {
      accounts: result.data,
      total: result.total,
      summary: result.summary,
    }
  },

  /**
   * Buscar conta por ID
   */
  async getById(id: number): Promise<PayableAccount> {
    const response = await fetch(`${API_BASE_URL}/admin/payable-accounts/${id}`)

    if (!response.ok) {
      throw new Error('Erro ao buscar conta')
    }

    const result: ApiResponse<PayableAccount> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Conta não encontrada')
    }

    return result.data
  },

  /**
   * Criar nova conta
   */
  async createAccount(data: CreatePayableAccountRequest): Promise<PayableAccount> {
    const response = await fetch(`${API_BASE_URL}/admin/payable-accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erro ao criar conta')
    }

    const result: ApiResponse<PayableAccount> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao criar conta')
    }

    return result.data
  },

  /**
   * Gerar conta automaticamente
   */
  async autoGenerate(
    storeId: number,
    referenceMonth: string,
    period: string = 'monthly'
  ): Promise<PayableAccount> {
    const response = await fetch(`${API_BASE_URL}/admin/payable-accounts/auto-generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        store_id: storeId,
        reference_month: referenceMonth,
        payment_report_period: period,
      }),
    })

    if (!response.ok) {
      throw new Error('Erro ao gerar conta automaticamente')
    }

    const result: ApiResponse<PayableAccount> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao gerar conta')
    }

    return result.data
  },

  /**
   * Atualizar conta
   */
  async updateAccount(
    id: number,
    data: Partial<CreatePayableAccountRequest>
  ): Promise<PayableAccount> {
    const response = await fetch(`${API_BASE_URL}/admin/payable-accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erro ao atualizar conta')
    }

    const result: ApiResponse<PayableAccount> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao atualizar conta')
    }

    return result.data
  },

  /**
   * Aprovar conta
   */
  async approve(id: number, approvedBy: number): Promise<PayableAccount> {
    const response = await fetch(`${API_BASE_URL}/admin/payable-accounts/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ approved_by: approvedBy }),
    })

    if (!response.ok) {
      throw new Error('Erro ao aprovar conta')
    }

    const result: ApiResponse<PayableAccount> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao aprovar conta')
    }

    return result.data
  },

  /**
   * Registrar pagamento
   */
  async registerPayment(
    id: number,
    data: {
      payment_date: string
      payment_method: string
      paid_by: number
      notes?: string
    }
  ): Promise<PayableAccount> {
    const response = await fetch(`${API_BASE_URL}/admin/payable-accounts/${id}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erro ao registrar pagamento')
    }

    const result: ApiResponse<PayableAccount> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao registrar pagamento')
    }

    return result.data
  },

  /**
   * Cancelar conta
   */
  async cancel(id: number): Promise<PayableAccount> {
    const response = await fetch(`${API_BASE_URL}/admin/payable-accounts/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Erro ao cancelar conta')
    }

    const result: ApiResponse<PayableAccount> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao cancelar conta')
    }

    return result.data
  },

  /**
   * Aprovar múltiplas contas
   */
  async bulkApprove(accountIds: number[], approvedBy: number): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/admin/payable-accounts/bulk-approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_ids: accountIds,
        approved_by: approvedBy,
      }),
    })

    if (!response.ok) {
      throw new Error('Erro na aprovação em lote')
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Erro na aprovação em lote')
    }

    return result.approved_count
  },

  /**
   * Registrar pagamento de múltiplas contas
   */
  async bulkPayment(
    accountIds: number[],
    data: {
      payment_date: string
      payment_method: string
      paid_by: number
      notes?: string
    }
  ): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/admin/payable-accounts/bulk-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_ids: accountIds,
        ...data,
      }),
    })

    if (!response.ok) {
      throw new Error('Erro no pagamento em lote')
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Erro no pagamento em lote')
    }

    return result.paid_count
  },

  /**
   * Obter resumo financeiro
   */
  async getSummary(filters: PayableAccountFilters): Promise<PayableAccountSummary> {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value))
      }
    })

    const response = await fetch(
      `${API_BASE_URL}/admin/payable-accounts/summary?${params.toString()}`
    )

    if (!response.ok) {
      throw new Error('Erro ao buscar resumo')
    }

    const result: ApiResponse<PayableAccountSummary> = await response.json()

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Erro ao buscar resumo')
    }

    return result.data
  },
}
