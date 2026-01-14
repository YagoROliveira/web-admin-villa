import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import { CashbackService } from '../api/cashback-service'
import type {
  Cashback,
  CashbackFilters,
  CashbackStats,
  PaginationParams,
  ProcessCashbackRequest,
  CreateCashbackRequest,
} from '../types'
import { useAuthStore } from '@/stores/auth-store'

interface CashbackProviderProps {
  children: ReactNode
}

interface CashbackContextType {
  // Estado
  cashbacks: Cashback[]
  stats: CashbackStats | null
  isLoading: boolean
  error: string | null
  filters: CashbackFilters
  pagination: PaginationParams

  // Ações
  fetchCashbacks: (newFilters?: CashbackFilters) => Promise<void>
  fetchStats: () => Promise<void>
  processCashback: (data: ProcessCashbackRequest) => Promise<void>
  createCashback: (data: CreateCashbackRequest) => Promise<void>
  processById: (cashbackId: number) => Promise<void>
  resendNotification: (cashbackId: number) => Promise<void>
  setFilters: (filters: CashbackFilters) => void
  setPagination: (pagination: PaginationParams) => void
  refreshData: () => Promise<void>
}

const CashbackContext = createContext<CashbackContextType | undefined>(
  undefined
)

export function CashbackProvider({ children }: CashbackProviderProps) {
  const { auth } = useAuthStore()
  const token = auth.accessToken

  // Estado
  const [cashbacks, setCashbacks] = useState<Cashback[]>([])
  const [stats, setStats] = useState<CashbackStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CashbackFilters>({})
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  /**
   * Busca lista de cashbacks com filtros
   */
  const fetchCashbacks = useCallback(
    async (newFilters?: CashbackFilters, newPagination?: PaginationParams) => {
      setIsLoading(true)
      setError(null)

      try {
        const currentFilters = newFilters || filters
        const currentPagination = newPagination || pagination
        const response = await CashbackService.list(
          currentFilters,
          currentPagination,
          token
        )

        if (response.success && response.data) {
          // A API retorna { cashbacks: [], total, limit, offset }
          const cashbacksArray = response.data.cashbacks || []
          const total = response.data.total || 0

          // Adiciona valores formatados em reais (converte strings para números)
          const formattedCashbacks = cashbacksArray.map((cashback) => ({
            ...cashback,
            orderAmountReais: Number(cashback.orderAmountCents) / 100,
            cashbackAmountReais: Number(cashback.cashbackAmountCents) / 100,
          }))

          setCashbacks(formattedCashbacks)
          setPagination((prev) => ({ ...prev, totalItems: total }))
        } else {
          // Se for 404, não mostra erro - apenas lista vazia
          if (response.error?.includes('não foi implementado')) {
            setCashbacks([])
            setError(null) // Limpa erro para não poluir UI
          } else {
            setError(response.error || 'Erro ao buscar cashbacks')
          }
        }
      } catch (err) {
        console.error('❌ Erro ao buscar cashbacks:', err)
        setCashbacks([]) // Garante lista vazia em caso de erro
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setIsLoading(false)
      }
    },
    [token]
  )

  /**
   * Busca estatísticas de cashback
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await CashbackService.getStats(token)
      if (response.success && response.data) {
        setStats({
          ...response.data,
          totalAmountReais: Number(response.data.totalAmountCents) / 100,
        })
      } else if (response.error?.includes('não foi implementado')) {
        // Se backend não existe, usa dados zerados
        setStats({
          total: 0,
          pending: 0,
          completed: 0,
          failed: 0,
          totalAmountCents: 0,
          totalAmountReais: 0,
        })
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
      // Em caso de erro, usa stats zeradas
      setStats({
        total: 0,
        pending: 0,
        completed: 0,
        failed: 0,
        totalAmountCents: 0,
        totalAmountReais: 0,
      })
    }
  }, [token])

  /**
   * Processa cashback completo
   */
  const processCashback = useCallback(
    async (data: ProcessCashbackRequest) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await CashbackService.processCashback(data, token)

        if (!response.success) {
          if (response.isDuplicate) {
            throw new Error('Cashback já existe para este pedido')
          }
          throw new Error(response.error || 'Erro ao processar cashback')
        }

        // Atualiza a lista
        await fetchCashbacks()
        await fetchStats()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [token, fetchCashbacks, fetchStats]
  )

  /**
   * Cria cashback sem processar
   */
  const createCashback = useCallback(
    async (data: CreateCashbackRequest) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await CashbackService.createCashback(data, token)

        if (!response.success) {
          if (response.isDuplicate) {
            throw new Error('Cashback já existe para este pedido')
          }
          throw new Error(response.error || 'Erro ao criar cashback')
        }

        await fetchCashbacks()
        await fetchStats()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [token, fetchCashbacks, fetchStats]
  )

  /**
   * Processa um cashback específico por ID
   */
  const processById = useCallback(
    async (cashbackId: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await CashbackService.processById(cashbackId, token)

        if (!response.success) {
          throw new Error(response.error || 'Erro ao processar cashback')
        }

        await fetchCashbacks()
        await fetchStats()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [token, fetchCashbacks, fetchStats]
  )

  /**
   * Reenvia notificação
   */
  const resendNotification = useCallback(
    async (cashbackId: number) => {
      try {
        const response = await CashbackService.resendNotification(
          cashbackId,
          token
        )
        if (!response.success) {
          throw new Error(response.error || 'Erro ao enviar notificação')
        }
        await fetchCashbacks()
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido'
        setError(errorMessage)
        throw err
      }
    },
    [token, fetchCashbacks]
  )

  /**
   * Atualiza todos os dados
   */
  const refreshData = useCallback(async () => {
    await Promise.all([fetchCashbacks(), fetchStats()])
  }, [fetchCashbacks, fetchStats])

  // Carrega dados iniciais
  useEffect(() => {
    if (token) {
      fetchCashbacks()
      fetchStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const value: CashbackContextType = {
    cashbacks,
    stats,
    isLoading,
    error,
    filters,
    pagination,
    fetchCashbacks,
    fetchStats,
    processCashback,
    createCashback,
    processById,
    resendNotification,
    setFilters,
    setPagination,
    refreshData,
  }

  return (
    <CashbackContext.Provider value={value}>
      {children}
    </CashbackContext.Provider>
  )
}

export function useCashback() {
  const context = useContext(CashbackContext)
  if (!context) {
    throw new Error('useCashback must be used within a CashbackProvider')
  }
  return context
}
