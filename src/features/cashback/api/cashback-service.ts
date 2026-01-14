import { API_CONFIG, buildApiUrl, getAuthHeaders } from '@/config/api'
import type {
  ApiResponse,
  Cashback,
  CashbackAuditLog,
  CashbackFilters,
  CashbackStats,
  CreateCashbackRequest,
  PaginationParams,
  ProcessCashbackRequest,
  ProcessCashbackResponse,
  ProcessPendingRequest,
  RetryFailedRequest,
  RunWorkerRequest,
  RunWorkerDateRangeRequest,
  WorkerRunResponse,
  WorkerStats,
} from '../types'

const BASE_URL = API_CONFIG.BASE_URL

/**
 * Helper para tratar erros da API
 */
async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Se for 404, retorna resposta vazia/erro amigável
  if (response.status === 404) {
    return {
      success: false,
      error: 'Endpoint não encontrado. O backend de cashback ainda não foi implementado.',
      data: undefined as any,
    }
  }

  // Tenta fazer parse do JSON
  try {
    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      error: `Erro ao processar resposta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      data: undefined as any,
    }
  }
}

/**
 * Serviço de API para gerenciamento de cashback
 */
export class CashbackService {
  /**
   * Processa cashback completo (cria, processa e notifica)
   */
  static async processCashback(
    data: ProcessCashbackRequest,
    token?: string
  ): Promise<ApiResponse<ProcessCashbackResponse>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.PROCESS}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      }
    )

    return handleApiResponse<ProcessCashbackResponse>(response)
  }

  /**
   * Cria cashback sem processar (status PENDING)
   */
  static async createCashback(
    data: CreateCashbackRequest,
    token?: string
  ): Promise<ApiResponse<ProcessCashbackResponse>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.CREATE}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      }
    )

    return handleApiResponse<ProcessCashbackResponse>(response)
  }

  /**
   * Processa um cashback específico por ID
   */
  static async processById(
    cashbackId: number,
    token?: string
  ): Promise<ApiResponse<ProcessCashbackResponse>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.PROCESS_BY_ID}/${cashbackId}/process`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
      }
    )

    return handleApiResponse<ProcessCashbackResponse>(response)
  }

  /**
   * Lista cashbacks de um usuário
   */
  static async listByUser(
    userId: string,
    filters?: CashbackFilters,
    pagination?: PaginationParams,
    token?: string
  ): Promise<ApiResponse<Cashback[]>> {
    const params: Record<string, string> = {}

    // Filtros
    if (filters?.status) params.status = filters.status
    if (filters?.campaignId) params.campaignId = filters.campaignId
    if (filters?.startDate) params.startDate = filters.startDate
    if (filters?.endDate) params.endDate = filters.endDate

    // Paginação: converte page para offset
    if (pagination?.limit) params.limit = pagination.limit.toString()
    if (pagination?.page && pagination?.limit) {
      const offset = (pagination.page - 1) * pagination.limit
      params.offset = offset.toString()
    }

    // Ordenação
    if (pagination?.sortBy) params.sortBy = pagination.sortBy
    if (pagination?.sortOrder) params.sortOrder = pagination.sortOrder

    const url = buildApiUrl(
      `${API_CONFIG.ENDPOINTS.CASHBACK.LIST_BY_USER}/${userId}`,
      params
    )

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    return handleApiResponse<Cashback[]>(response)
  }

  /**
   * Busca cashback por order ID
   */
  static async getByOrderId(
    orderId: string,
    token?: string
  ): Promise<ApiResponse<Cashback>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.GET_BY_ORDER}/${orderId}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    )

    return handleApiResponse<Cashback>(response)
  }

  /**
   * Lista cashbacks com filtros e paginação
   */
  static async list(
    filters?: CashbackFilters,
    pagination?: PaginationParams,
    token?: string
  ): Promise<ApiResponse<Cashback[]>> {
    const params: Record<string, string> = {}

    // Filtros
    if (filters?.status) params.status = filters.status
    if (filters?.userId) params.userId = filters.userId
    if (filters?.campaignId) params.campaignId = filters.campaignId
    if (filters?.startDate) params.startDate = filters.startDate
    if (filters?.endDate) params.endDate = filters.endDate

    // Paginação: converte page para offset
    if (pagination?.limit) params.limit = pagination.limit.toString()
    if (pagination?.page && pagination?.limit) {
      const offset = (pagination.page - 1) * pagination.limit
      params.offset = offset.toString()
    }

    // Ordenação
    if (pagination?.sortBy) params.sortBy = pagination.sortBy
    if (pagination?.sortOrder) params.sortOrder = pagination.sortOrder

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.CASHBACK.LIST, params)

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    return handleApiResponse<Cashback[]>(response)
  }

  /**
   * Busca logs de auditoria de um cashback
   */
  static async getAuditLogs(
    cashbackId: number,
    token?: string
  ): Promise<ApiResponse<CashbackAuditLog[]>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.AUDIT}/${cashbackId}/audit`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    )

    return handleApiResponse<CashbackAuditLog[]>(response)
  }

  /**
   * Busca estatísticas de cashback
   */
  static async getStats(token?: string): Promise<ApiResponse<CashbackStats>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.STATS}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    )

    return handleApiResponse<CashbackStats>(response)
  }

  /**
   * Processa cashbacks pendentes (job)
   */
  static async processPending(
    data: ProcessPendingRequest,
    token?: string
  ): Promise<ApiResponse<{ processedCount: number }>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.PROCESS_PENDING}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      }
    )

    return handleApiResponse<{ processedCount: number }>(response)
  }

  /**
   * Tenta reprocessar cashbacks que falharam
   */
  static async retryFailed(
    data: RetryFailedRequest,
    token?: string
  ): Promise<ApiResponse<{ retriedCount: number }>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.RETRY_FAILED}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      }
    )

    return handleApiResponse<{ retriedCount: number }>(response)
  }

  /**
   * Reenvia notificação de um cashback
   */
  static async resendNotification(
    cashbackId: number,
    token?: string
  ): Promise<ApiResponse> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.NOTIFY}/${cashbackId}/notify`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
      }
    )

    return handleApiResponse(response)
  }

  /**
   * Roda o worker de cashback manualmente
   */
  static async runWorker(
    data: RunWorkerRequest,
    token?: string
  ): Promise<ApiResponse<WorkerRunResponse>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.WORKER_RUN}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      }
    )

    return handleApiResponse<WorkerRunResponse>(response)
  }

  /**
   * Roda o worker de cashback para um período específico
   */
  static async runWorkerDateRange(
    data: RunWorkerDateRangeRequest,
    token?: string
  ): Promise<ApiResponse<WorkerRunResponse>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.WORKER_RUN_DATE_RANGE}`,
      {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data),
      }
    )

    return handleApiResponse<WorkerRunResponse>(response)
  }

  /**
   * Busca estatísticas do worker
   */
  static async getWorkerStats(
    token?: string
  ): Promise<ApiResponse<WorkerStats>> {
    const response = await fetch(
      `${BASE_URL}${API_CONFIG.ENDPOINTS.CASHBACK.WORKER_STATS}`,
      {
        method: 'GET',
        headers: getAuthHeaders(token),
      }
    )

    return handleApiResponse<WorkerStats>(response)
  }

  /**
   * Helper: Formata valor em centavos para reais
   */
  static formatCentsToReais(cents: number): string {
    return (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  /**
   * Helper: Converte reais para centavos
   */
  static reaisToCents(reais: number): number {
    return Math.round(reais * 100)
  }
}
