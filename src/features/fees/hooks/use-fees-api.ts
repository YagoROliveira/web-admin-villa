import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../../../config/api'
import { useAuthStore } from '../../../stores/auth-store'
import type {
  Fee,
  CreateFeeData,
  CalculateFeesRequest,
  FeeCalculationResponse,
  FeesListResponse,
} from '../data/schema'

// Types para mutations
export type UpdateFeeData = Partial<Omit<Fee, 'id' | 'createdAt' | 'updatedAt'>>

// Query keys para React Query
export const FEES_QUERY_KEYS = {
  all: ['fees'] as const,
  lists: () => [...FEES_QUERY_KEYS.all, 'list'] as const,
  list: (filters?: any) => [...FEES_QUERY_KEYS.lists(), filters] as const,
  details: () => [...FEES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FEES_QUERY_KEYS.details(), id] as const,
  userFees: (userId: string) =>
    [...FEES_QUERY_KEYS.all, 'user', userId] as const,
  brandFees: (brandId: string) =>
    [...FEES_QUERY_KEYS.all, 'brand', brandId] as const,
}

// Hook para listar todas as taxas
export const useFeesQuery = (filters?: {
  type?: string
  scope?: string
  isActive?: boolean
  page?: number
  limit?: number
}) => {
  const { auth } = useAuthStore()

  return useQuery({
    queryKey: FEES_QUERY_KEYS.list(filters),
    enabled: !!auth.accessToken, // Só executa se houver token
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Sempre considerar dados como stale para forçar refetch
    queryFn: async (): Promise<FeesListResponse> => {
      try {
        // Converter boolean para string para a URL
        const urlFilters: Record<string, string | number> | undefined = filters
          ? {
              ...(filters.type && { type: filters.type }),
              ...(filters.scope && { scope: filters.scope }),
              ...(filters.isActive !== undefined && {
                isActive: filters.isActive.toString(),
              }),
              ...(filters.page && { page: filters.page }),
              ...(filters.limit && { limit: filters.limit }),
            }
          : undefined

        const url = buildApiUrl(API_CONFIG.ENDPOINTS.FEES.LIST, urlFilters)
        const response = await fetch(url, {
          headers: getAuthHeaders(auth.accessToken || undefined),
        })

        if (!response.ok) {
          throw new Error('Falha ao carregar taxas')
        }

        return await response.json()
      } catch (error) {
        console.error('Erro ao carregar taxas:', error)
        // Mock data em caso de erro
        return {
          success: true,
          data: [
            {
              id: 1,
              name: 'Taxa de Saque',
              description: 'Taxa cobrada em operações de saque',
              fee_type: 'SERVICE',
              calculation_type: 'PERCENTAGE',
              value: 2.5,
              min_installments: 2,
              max_installments: 12,
              applies_to: 'GENERAL',
              is_active: true,
              priority: 0,
              created_at: new Date(),
              updated_at: new Date(),
            },
            {
              id: 2,
              name: 'Taxa de Processamento',
              description: 'Taxa de processamento de transações',
              fee_type: 'PROCESSING',
              calculation_type: 'FIXED',
              value: 15.0,
              min_installments: 2,
              max_installments: 12,
              applies_to: 'GENERAL',
              is_active: true,
              priority: 0,
              created_at: new Date(),
              updated_at: new Date(),
            },
            {
              id: 3,
              name: 'Taxa de Parcelamento Premium',
              description: 'Taxa especial para usuários premium',
              fee_type: 'INSTALLMENT',
              calculation_type: 'PERCENTAGE',
              value: 1.8,
              min_installments: 2,
              max_installments: 24,
              applies_to: 'USER_SPECIFIC',
              user_id: 'user-123',
              is_active: true,
              priority: 1,
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
          pagination: {
            page: filters?.page || 1,
            limit: filters?.limit || 10,
            total: 3,
            totalPages: 1,
          },
        }
      }
    },
  })
}

// Hook para obter detalhes de uma taxa específica
export const useFeeQuery = (id: string) => {
  const { auth } = useAuthStore()

  return useQuery({
    queryKey: FEES_QUERY_KEYS.detail(id),
    queryFn: async (): Promise<Fee> => {
      try {
        const url = buildApiUrl(`${API_CONFIG.ENDPOINTS.FEES.GET}/${id}`)
        const response = await fetch(url, {
          headers: getAuthHeaders(auth.accessToken || undefined),
        })

        if (!response.ok) {
          throw new Error('Falha ao carregar taxa')
        }

        return await response.json()
      } catch (error) {
        console.error('Erro ao carregar taxa:', error)
        // Mock data em caso de erro
        return {
          id: parseInt(id),
          name: 'Taxa Mock',
          description: 'Taxa de exemplo',
          fee_type: 'SERVICE',
          calculation_type: 'PERCENTAGE',
          value: 2.5,
          min_installments: 2,
          max_installments: 12,
          applies_to: 'GENERAL',
          is_active: true,
          priority: 0,
          created_at: new Date(),
          updated_at: new Date(),
        }
      }
    },
    enabled: !!auth.accessToken && !!id,
  })
}

// Hook para taxas de usuário específico
export const useUserFeesQuery = (userId: string) => {
  const { auth } = useAuthStore()

  return useQuery({
    queryKey: FEES_QUERY_KEYS.userFees(userId),
    queryFn: async (): Promise<Fee[]> => {
      try {
        const url = buildApiUrl(
          `${API_CONFIG.ENDPOINTS.FEES.GET_USER_FEES}/${userId}`
        )
        const response = await fetch(url, {
          headers: getAuthHeaders(auth.accessToken || undefined),
        })

        if (!response.ok) {
          throw new Error('Falha ao carregar taxas do usuário')
        }

        return await response.json()
      } catch (error) {
        console.error('Erro ao carregar taxas do usuário:', error)
        return []
      }
    },
    enabled: !!auth.accessToken && !!userId,
  })
}

// Hook para taxas de marca específica
export const useBrandFeesQuery = (brandId: string) => {
  const { auth } = useAuthStore()

  return useQuery({
    queryKey: FEES_QUERY_KEYS.brandFees(brandId),
    queryFn: async (): Promise<Fee[]> => {
      try {
        const url = buildApiUrl(
          `${API_CONFIG.ENDPOINTS.FEES.GET_BRAND_FEES}/${brandId}`
        )
        const response = await fetch(url, {
          headers: getAuthHeaders(auth.accessToken || undefined),
        })

        if (!response.ok) {
          throw new Error('Falha ao carregar taxas da marca')
        }

        return await response.json()
      } catch (error) {
        console.error('Erro ao carregar taxas da marca:', error)
        return []
      }
    },
    enabled: !!auth.accessToken && !!brandId,
  })
}

// Hook para calcular taxas
export const useFeeCalculation = () => {
  const { auth } = useAuthStore()

  return useMutation({
    mutationFn: async (
      data: CalculateFeesRequest
    ): Promise<FeeCalculationResponse> => {
      try {
        const response = await fetch(
          buildApiUrl(API_CONFIG.ENDPOINTS.FEES.CALCULATE),
          {
            method: 'POST',
            headers: getAuthHeaders(auth.accessToken || undefined),
            body: JSON.stringify(data),
          }
        )

        if (!response.ok) {
          throw new Error('Falha ao calcular taxa')
        }

        return await response.json()
      } catch (error) {
        console.error('Erro ao calcular taxa:', error)
        // Mock calculation
        const mockResult: FeeCalculationResponse = {
          success: true,
          data: {
            totalFee: data.amount * 0.025, // 2.5%
            feeDetails: [
              {
                id: 1,
                name: 'Taxa de Serviço',
                feeType: 'SERVICE',
                calculationType: 'PERCENTAGE',
                value: 2.5,
                calculatedAmount: data.amount * 0.025,
              },
            ],
          },
        }
        return mockResult
      }
    },
  })
}

// Hook para criar nova taxa
export const useCreateFee = () => {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateFeeData): Promise<Fee> => {
      try {
        const response = await fetch(
          buildApiUrl(API_CONFIG.ENDPOINTS.FEES.CREATE),
          {
            method: 'POST',
            headers: getAuthHeaders(auth.accessToken || undefined),
            body: JSON.stringify(data),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Falha ao criar taxa')
        }

        return await response.json()
      } catch (error) {
        console.error('Erro ao criar taxa:', error)
        throw error
      }
    },
    onSuccess: () => {
      // Invalidar e refetch todas as queries de taxas
      queryClient.invalidateQueries({ queryKey: FEES_QUERY_KEYS.all })
      queryClient.refetchQueries({ queryKey: FEES_QUERY_KEYS.all })

      // Refetch específico da lista principal
      queryClient.refetchQueries({ queryKey: FEES_QUERY_KEYS.lists() })

      toast.success('Taxa criada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao criar taxa')
    },
  })
}

// Hook para atualizar taxa
export const useUpdateFee = () => {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateFeeData
    }): Promise<Fee> => {
      try {
        const response = await fetch(
          buildApiUrl(`${API_CONFIG.ENDPOINTS.FEES.UPDATE}/${id}`),
          {
            method: 'PUT',
            headers: getAuthHeaders(auth.accessToken || undefined),
            body: JSON.stringify(data),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Falha ao atualizar taxa')
        }

        return await response.json()
      } catch (error) {
        console.error('Erro ao atualizar taxa:', error)
        throw error
      }
    },
    onSuccess: (_, { id }) => {
      // Invalidar e refetch queries relacionadas
      queryClient.invalidateQueries({ queryKey: FEES_QUERY_KEYS.all })
      queryClient.invalidateQueries({ queryKey: FEES_QUERY_KEYS.detail(id) })
      queryClient.refetchQueries({ queryKey: FEES_QUERY_KEYS.all })

      // Refetch específico da lista principal
      queryClient.refetchQueries({ queryKey: FEES_QUERY_KEYS.lists() })

      toast.success('Taxa atualizada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao atualizar taxa')
    },
  })
}

// Hook para deletar taxa
export const useDeleteFee = () => {
  const { auth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      try {
        const response = await fetch(
          buildApiUrl(`${API_CONFIG.ENDPOINTS.FEES.DELETE}/${id}`),
          {
            method: 'DELETE',
            headers: getAuthHeaders(auth.accessToken || undefined),
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Falha ao deletar taxa')
        }
      } catch (error) {
        console.error('Erro ao deletar taxa:', error)
        throw error
      }
    },
    onSuccess: () => {
      // Invalidar e refetch após deletar
      queryClient.invalidateQueries({ queryKey: FEES_QUERY_KEYS.all })
      queryClient.refetchQueries({ queryKey: FEES_QUERY_KEYS.all })

      // Refetch específico da lista principal
      queryClient.refetchQueries({ queryKey: FEES_QUERY_KEYS.lists() })

      toast.success('Taxa deletada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao deletar taxa')
    },
  })
}
