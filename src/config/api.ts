// Configuração da API
export const API_CONFIG = {
  // Base URL da API
  BASE_URL: 'https://localhost',

  // Endpoints específicos
  ENDPOINTS: {
    // Autenticação
    AUTH: {
      LOGIN: '/wallet/auth/login',
      LOGOUT: '/wallet/auth/logout',
      REFRESH: '/wallet/auth/refresh',
      VALIDATE: '/wallet/auth/validate',
      ME: '/wallet/auth/me',
    },

    // Usuários
    USERS: {
      LIST: '/wallet/users',
      CREATE: '/wallet/users',
      GET: '/wallet/users',
      UPDATE: '/wallet/users',
      DELETE: '/wallet/users',
    },

    // Empréstimos
    LOANS: {
      APPROVE: '/wallet/v1/loan/approve',
      REJECT: '/wallet/v1/loan/reject',
      GET_ANALYSIS_DATA: '/wallet/v1/loan/get-data-to-analisys',
      LIST: '/wallet/v1/loans',
      LIST_ALL: '/wallet/v1/list-loans-all', // Para loans-provider
    },

    // Stories/Histórias
    STORIES: {
      LIST_ALL: '/wallet/v1/all-stories',
      LIST_MODULES: '/wallet/v1/admin/list-modules',
    },

    // Transações/Logs
    TRANSACTIONS: {
      LIST: '/wallet/transactions',
      LOGS: '/wallet/logs',
    },
  },
}

// Helper function para construir URLs completas
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString())
    })
    url += `?${searchParams.toString()}`
  }

  return url
}

// Configurações de fetch padrão
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}