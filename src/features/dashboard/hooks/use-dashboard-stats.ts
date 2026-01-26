import { useQuery } from '@tanstack/react-query'
import { buildApiUrl, API_CONFIG } from '@/config/api'

// Tipos para as estatísticas do dashboard
interface DashboardStats {
  cashback: {
    total: number
    processed: number
    pending: number
  }
  orders: {
    total: number
    processed: number
  }
  loans: {
    totalRequested: number
    totalApproved: number
    totalToReceive: number
    overdueInstallments: number
  }
}

interface CashbackByMonth {
  month: string
  total: number
}

interface RecentCashback {
  id: string
  userName: string
  userEmail: string
  amount: number
  status: string
  createdAt: string
}

// Hook para buscar cashbacks recentes
export function useRecentCashbacks() {
  return useQuery({
    queryKey: ['dashboard', 'recent-cashbacks'],
    queryFn: async () => {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.CASHBACK.LIST)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar cashbacks recentes')
      }
      
      const data = await response.json()
      
      // Ordenar por data e pegar os 5 mais recentes
      if (Array.isArray(data)) {
        return data
          .sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
          .map((item: any) => ({
            id: item.id,
            userName: item.userName || item.user?.name || 'Usuário',
            userEmail: item.userEmail || item.user?.email || '',
            amount: parseFloat(item.cashbackAmount || item.amount || 0),
            status: item.status || 'processed',
            createdAt: item.createdAt,
          }))
      }
      
      return []
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

// Hook para buscar cashback por mês
export function useCashbackByMonth() {
  return useQuery({
    queryKey: ['dashboard', 'cashback-by-month'],
    queryFn: async () => {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.CASHBACK.LIST)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de cashback por mês')
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        return []
      }
      
      // Agrupar por mês
      const monthlyData: { [key: string]: number } = {}
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      
      data.forEach((item: any) => {
        if (item.createdAt) {
          const date = new Date(item.createdAt)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          const amount = parseFloat(item.cashbackAmount || item.amount || 0)
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey] += amount
          } else {
            monthlyData[monthKey] = amount
          }
        }
      })
      
      // Converter para array e ordenar
      const result = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12) // Últimos 12 meses
        .map(([key, total]) => {
          const [year, month] = key.split('-')
          const monthIndex = parseInt(month) - 1
          return {
            month: monthNames[monthIndex],
            total,
          }
        })
      
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar estatísticas de cashback
export function useCashbackStats() {
  return useQuery({
    queryKey: ['dashboard', 'cashback-stats'],
    queryFn: async () => {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.CASHBACK.STATS)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas de cashback')
      }
      
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar estatísticas de empréstimos
export function useLoanStats() {
  return useQuery({
    queryKey: ['dashboard', 'loan-stats'],
    queryFn: async () => {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.LIST_ALL)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas de empréstimos')
      }
      
      const loans = await response.json()
      
      // Calcular estatísticas
      const totalRequested = loans.length
      const totalApproved = loans.filter(
        (loan: any) => loan.approvalStatus === 'APPROVED'
      ).length
      
      // Calcular total a receber (soma dos valores aprovados)
      const totalToReceive = loans
        .filter((loan: any) => loan.approvalStatus === 'APPROVED')
        .reduce((sum: number, loan: any) => {
          return sum + parseFloat(loan.valueApproved || loan.amountRequested || 0)
        }, 0)
      
      // Calcular parcelas atrasadas
      const overdueInstallments = loans.reduce((count: number, loan: any) => {
        if (loan.installments && Array.isArray(loan.installments)) {
          const overdue = loan.installments.filter((inst: any) => {
            if (!inst.dueDate || inst.paymentDate) return false
            const dueDate = new Date(inst.dueDate)
            return dueDate < new Date() && !inst.paymentDate
          }).length
          return count + overdue
        }
        return count
      }, 0)
      
      return {
        totalRequested,
        totalApproved,
        totalToReceive,
        overdueInstallments,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook para buscar estatísticas de pedidos/transações
export function useOrderStats() {
  return useQuery({
    queryKey: ['dashboard', 'order-stats'],
    queryFn: async () => {
      const url = buildApiUrl(API_CONFIG.ENDPOINTS.TRANSACTIONS.LIST)
      const response = await fetch(url)
      
      if (!response.ok) {
        // Se não houver endpoint, retornar dados mockados
        return {
          total: 0,
          processed: 0,
        }
      }
      
      const transactions = await response.json()
      
      return {
        total: Array.isArray(transactions) ? transactions.length : 0,
        processed: Array.isArray(transactions)
          ? transactions.filter((t: any) => t.status === 'completed').length
          : 0,
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Hook principal que combina todas as estatísticas
export function useDashboardStats() {
  const cashbackStats = useCashbackStats()
  const loanStats = useLoanStats()
  const orderStats = useOrderStats()

  return {
    cashback: cashbackStats,
    loans: loanStats,
    orders: orderStats,
    isLoading:
      cashbackStats.isLoading || loanStats.isLoading || orderStats.isLoading,
    isError: cashbackStats.isError || loanStats.isError || orderStats.isError,
  }
}
