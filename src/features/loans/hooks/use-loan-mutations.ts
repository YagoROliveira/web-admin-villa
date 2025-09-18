import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { buildApiUrl, API_CONFIG } from '@/config/api'

// Tipos para as operações de empréstimo
interface ApprovalData {
  maxInstallments: number
  interestRate: number
  valueApproved: number
}

interface RejectionData {
  analysisNote: string
}

interface ApprovalResponse {
  message: string
  loan: {
    id: string
    userId: number
    approvalStatus: string
    maxInstallments: number
    interestRate: number
    valueApproved: number
    valueApprovedHistory: number
    step: string
    updatedAt: string
  }
}

interface RejectionResponse {
  message: string
  loan: {
    id: string
    userId: number
    approvalStatus: string
    analysisNotes: string
    valueApproved: number
    step: string
    updatedAt: string
  }
}

// Hook para aprovação de empréstimo
export function useApproveLoan() {
  const queryClient = useQueryClient()

  return useMutation<ApprovalResponse, Error, { loanRequestId: string; data: ApprovalData; userId: string }>({
    mutationFn: async ({ loanRequestId, data, userId }) => {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.APPROVE)
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: String(userId), // Garantir que seja enviado como string
          loanRequestId,
          ...data,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Empréstimo aprovado com sucesso!')

      // Invalidar e refetch dos dados do empréstimo
      queryClient.invalidateQueries({
        queryKey: ['loan-details', variables.loanRequestId]
      })

      // Invalidar lista de empréstimos se existir
      queryClient.invalidateQueries({
        queryKey: ['loans']
      })

      // Recarregar a página para atualizar os dados
      window.location.reload()
    },
    onError: (error) => {
      console.error('Erro ao aprovar empréstimo:', error)
      toast.error(error.message || 'Erro ao aprovar empréstimo')
    },
  })
}

// Hook para recusa de empréstimo
export function useRejectLoan() {
  const queryClient = useQueryClient()

  return useMutation<RejectionResponse, Error, { loanRequestId: string; data: RejectionData }>({
    mutationFn: async ({ loanRequestId, data }) => {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.REJECT)
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: '1', // TODO: Pegar o userId do contexto de autenticação
          loanRequestId,
          ...data,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      return response.json()
    },
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Empréstimo rejeitado com sucesso!')

      // Invalidar e refetch dos dados do empréstimo
      queryClient.invalidateQueries({
        queryKey: ['loan-details', variables.loanRequestId]
      })

      // Invalidar lista de empréstimos se existir
      queryClient.invalidateQueries({
        queryKey: ['loans']
      })

      // Recarregar a página para atualizar os dados
      window.location.reload()
    },
    onError: (error) => {
      console.error('Erro ao rejeitar empréstimo:', error)
      toast.error(error.message || 'Erro ao rejeitar empréstimo')
    },
  })
}

// Hook para buscar dados do empréstimo (para usar no React Query)
export function useLoanDetails(loanId: string) {
  return async () => {
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.GET_ANALYSIS_DATA, { requestId: loanId })
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro ${response.status}: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()

    // A API pode retornar um array ou um objeto direto
    let loanDetail
    if (Array.isArray(data)) {
      loanDetail = data.find((loan: any) => loan.id === loanId)
    } else if (data && typeof data === 'object') {
      loanDetail = data
    } else {
      throw new Error('Formato de dados inválido')
    }

    if (!loanDetail) {
      throw new Error('Empréstimo não encontrado')
    }

    return loanDetail
  }
}