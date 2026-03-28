// ─── VillaMarket NestJS API (port 5001) ───
const VILLAMARKET_API_URL =
  import.meta.env.VITE_VILLAMARKET_API_URL || 'http://localhost:5001'

export const VM_API = {
  BASE_URL: VILLAMARKET_API_URL,

  ENDPOINTS: {
    // ─── Auth ───
    AUTH: {
      ADMIN_LOGIN: '/v1/auth/admin/login',
      VENDOR_LOGIN: '/v1/auth/vendor/login',
      REFRESH: '/v1/auth/refresh',
      LOGOUT: '/v1/auth/logout',
      ME: '/v1/auth/me',
    },

    // ─── Users / Customers ───
    USERS: {
      LIST: '/v1/users',
      GET: (id: string) => `/v1/users/${id}`,
      UPDATE: (id: string) => `/v1/users/${id}`,
      DELETE: (id: string) => `/v1/users/${id}`,
      TOGGLE_ACTIVE: (id: string) => `/v1/users/${id}/toggle-active`,
      WALLET: (id: string) => `/v1/users/${id}/wallet`,
      ADD_FUND: (id: string) => `/v1/users/${id}/wallet/add-fund`,
      STATS: (id: string) => `/v1/users/${id}/stats`,
      ORDERS: (id: string) => `/v1/users/${id}/orders`,
      ADDRESSES: (id: string) => `/v1/users/${id}/addresses`,
      UPDATE_ADDRESS: (id: string, addressId: string) => `/v1/users/${id}/addresses/${addressId}`,
      SET_DEFAULT_ADDRESS: (id: string, addressId: string) => `/v1/users/${id}/addresses/${addressId}/set-default`,
      CONVERSATIONS: (id: string) => `/v1/users/${id}/conversations`,
      ACCESS_LOGS: (id: string) => `/v1/users/${id}/access-logs`,
      TOP_ITEMS: (id: string) => `/v1/users/${id}/top-items`,
    },

    // ─── Admin panel users ───
    ADMIN: {
      LIST: '/v1/admin',
      GET: (id: string) => `/v1/admin/${id}`,
      CREATE: '/v1/admin',
      UPDATE: (id: string) => `/v1/admin/${id}`,
      DELETE: (id: string) => `/v1/admin/${id}`,
      ROLES: '/v1/admin/roles',
    },

    // ─── Chat (MongoDB) ───
    CHAT: {
      CONVERSATIONS: '/v1/chat/conversations',
      CONVERSATION: (id: string) => `/v1/chat/conversations/${id}`,
      MESSAGES: (id: string) => `/v1/chat/conversations/${id}/messages`,
      MARK_READ: (id: string) => `/v1/chat/conversations/${id}/read`,
    },

    // ─── Notifications (MongoDB) ───
    NOTIFICATIONS: {
      LIST: '/v1/notifications',
      SEND: '/v1/notifications/send',
      SEND_BULK: '/v1/notifications/send-bulk',
      SEND_TOPIC: '/v1/notifications/send-to-topic',
      USER: (userId: string) => `/v1/notifications/user/${userId}`,
      MARK_READ: (id: string) => `/v1/notifications/${id}/read`,
      MARK_ALL_READ: (userId: string) =>
        `/v1/notifications/user/${userId}/read-all`,
      DELETE: (id: string) => `/v1/notifications/${id}`,
    },

    // ─── Audit (MongoDB) ───
    AUDIT: {
      LIST: '/v1/audit',
      DETAIL: (id: string) => `/v1/audit/${id}`,
      ENTITY_TIMELINE: (entityType: string, entityId: string) =>
        `/v1/audit/entity/${entityType}/${entityId}`,
    },

    // ─── Analytics (MongoDB) ───
    ANALYTICS: {
      TRACK: '/v1/analytics/track',
      TRACK_BULK: '/v1/analytics/track/bulk',
      STORE_DASHBOARD: (storeId: string) =>
        `/v1/analytics/store/${storeId}/dashboard`,
      STORE_METRICS: (storeId: string) =>
        `/v1/analytics/store/${storeId}/metrics`,
    },

    // ─── Media ───
    MEDIA: {
      UPLOAD: '/v1/media/upload',
      UPLOAD_MULTIPLE: '/v1/media/upload-multiple',
      DELETE: (id: string) => `/v1/media/${id}`,
    },

    // ─── Stores ───
    STORES: {
      LIST: '/v1/stores',
      GET: (id: string) => `/v1/stores/${id}`,
      CREATE: '/v1/stores',
      UPDATE: (id: string) => `/v1/stores/${id}`,
      DELETE: (id: string) => `/v1/stores/${id}`,
      TOGGLE_ACTIVE: (id: string) => `/v1/stores/${id}/toggle-active`,
      TOGGLE_APPROVED: (id: string) => `/v1/stores/${id}/toggle-approved`,
      TOGGLE_FEATURED: (id: string) => `/v1/stores/${id}/toggle-featured`,
      SCHEDULES: (id: string) => `/v1/stores/${id}/schedules`,
      PAYMENT_METHODS: (id: string) => `/v1/stores/${id}/payment-methods`,
      STATS: '/v1/stores/stats',
    },

    // ─── Orders ───
    ORDERS: {
      LIST: '/v1/orders',
      GET: (id: string) => `/v1/orders/${id}`,
      MY: '/v1/orders/my',
      BY_STORE: (storeId: string) => `/v1/orders/store/${storeId}`,
      STATS: '/v1/orders/stats',
      UPDATE_STATUS: (id: string) => `/v1/orders/${id}/status`,
      UPDATE_AMOUNTS: (id: string) => `/v1/orders/${id}/amounts`,
      UPDATE_NOTE: (id: string) => `/v1/orders/${id}/note`,
      ASSIGN_DM: (id: string) => `/v1/orders/${id}/assign`,
      CANCEL: (id: string) => `/v1/orders/${id}/cancel`,
    },

    // ─── Payments ───
    PAYMENTS: {
      PROCESS: '/v1/payments/process',
      REFUND: '/v1/payments/refund',
      TRANSACTIONS: '/v1/payments/transactions',
      ADMIN_WALLET: '/v1/payments/wallets/admin',
    },

    // ─── Catalog: Items ───
    ITEMS: {
      LIST: '/v1/catalog/items',
      GET: (id: string) => `/v1/catalog/items/${id}`,
      CREATE: '/v1/catalog/items',
      UPDATE: (id: string) => `/v1/catalog/items/${id}`,
      DELETE: (id: string) => `/v1/catalog/items/${id}`,
      TOGGLE_ACTIVE: (id: string) => `/v1/catalog/items/${id}/toggle`,
      APPROVE: (id: string) => `/v1/catalog/items/${id}/approve`,
      // Addons per-product
      SET_ADDONS: (id: string) => `/v1/catalog/items/${id}/addons`,
      ATTACH_ADDON: (id: string, addonId: string) => `/v1/catalog/items/${id}/addons/${addonId}`,
      DETACH_ADDON: (id: string, addonId: string) => `/v1/catalog/items/${id}/addons/${addonId}`,
      // Variations
      UPDATE_VARIATIONS: (id: string) => `/v1/catalog/items/${id}/variations`,
      // Stats
      STATS: (id: string) => `/v1/catalog/items/${id}/stats`,
    },

    // ─── Catalog: Addons ───
    ADDONS: {
      LIST: '/v1/catalog/addons',
      GET: (id: string) => `/v1/catalog/addons/${id}`,
      CREATE: '/v1/catalog/addons',
      UPDATE: (id: string) => `/v1/catalog/addons/${id}`,
      DELETE: (id: string) => `/v1/catalog/addons/${id}`,
    },

    // ─── Catalog: Brands ───
    BRANDS: {
      LIST: '/v1/catalog/brands',
      GET: (id: string) => `/v1/catalog/brands/${id}`,
      CREATE: '/v1/catalog/brands',
      UPDATE: (id: string) => `/v1/catalog/brands/${id}`,
      DELETE: (id: string) => `/v1/catalog/brands/${id}`,
    },

    // ─── Catalog: Categories ───
    CATEGORIES: {
      LIST: '/v1/catalog/categories',
      GET: (id: string) => `/v1/catalog/categories/${id}`,
      CREATE: '/v1/catalog/categories',
      UPDATE: (id: string) => `/v1/catalog/categories/${id}`,
      DELETE: (id: string) => `/v1/catalog/categories/${id}`,
    },

    // ─── Catalog: Units ───
    UNITS: {
      LIST: '/v1/catalog/units',
    },

    // ─── Vendors ───
    VENDORS: {
      LIST: '/v1/vendors',
      GET: (id: string) => `/v1/vendors/${id}`,
    },

    // ─── Zones ───
    ZONES: {
      LIST: '/v1/zones',
      GET: (id: string) => `/v1/zones/${id}`,
      CREATE: '/v1/zones',
      UPDATE: (id: string) => `/v1/zones/${id}`,
      DELETE: (id: string) => `/v1/zones/${id}`,
      TOGGLE_ACTIVE: (id: string) => `/v1/zones/${id}/toggle-active`,
      MODULES: (id: string) => `/v1/zones/${id}/modules`,
    },

    // ─── Platform Modules ───
    MODULES: {
      LIST: '/v1/modules',
      GET: (id: string) => `/v1/modules/${id}`,
      CREATE: '/v1/modules',
      UPDATE: (id: string) => `/v1/modules/${id}`,
      DELETE: (id: string) => `/v1/modules/${id}`,
      TOGGLE_ACTIVE: (id: string) => `/v1/modules/${id}/toggle-active`,
    },
  },
}

/** Build full URL for VillaMarket NestJS API */
export const buildVmApiUrl = (
  path: string,
  params?: Record<string, string | number>,
) => {
  let url = `${VM_API.BASE_URL}${path}`
  if (params) {
    const sp = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => sp.append(k, v.toString()))
    url += `?${sp.toString()}`
  }
  return url
}

// ─── Legacy Wallet API (port 9001) ───

// Configuração da API
export const API_CONFIG = {
  // Base URL da API
  // Em desenvolvimento, fica vazio para usar o proxy do Vite (evita CORS)
  // Em produção, definir VITE_API_BASE_URL=https://prod.villamarket.app
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '',

  // Endpoints específicos
  ENDPOINTS: {
    // Autenticação (legacy wallet-api — keep for backward compat)
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
      UPLOAD_PAYMENT_PROOF: '/wallet/v1/loan/upload-payment-proof',
      MARK_DISBURSED: '/wallet/v1/loan/mark-disbursed',
      SEND_NOTIFICATION: '/wallet/v1/loan/send-notification',
    },

    // Stories/Histórias
    STORIES: {
      LIST_ALL: '/wallet/v1/all-stories',
      LIST_MODULES: '/wallet/v1/admin/list-modules',
    },

    // Transações/Logs
    TRANSACTIONS: {
      LIST: '/wallet/v1/transactions',
      LOGS: '/wallet/v1/logs',
    },

    // Taxas/Fees
    FEES: {
      LIST: '/wallet/v1/fees',
      CREATE: '/wallet/v1/fees',
      GET: '/wallet/v1/fees',
      UPDATE: '/wallet/v1/fees',
      DELETE: '/wallet/v1/fees',
      CALCULATE: '/wallet/v1/fees/calculate',
      GET_USER_FEES: '/wallet/v1/fees/user',
      GET_BRAND_FEES: '/wallet/v1/fees/brand',
    },

    // Cashback
    CASHBACK: {
      PROCESS: '/cashback/process',
      CREATE: '/cashback/create',
      PROCESS_BY_ID: '/cashback',
      LIST: '/cashback/all',
      LIST_BY_USER: '/cashback/user',
      GET_BY_ORDER: '/cashback/order',
      AUDIT: '/cashback',
      STATS: '/cashback/stats',
      PROCESS_PENDING: '/cashback/process-pending',
      RETRY_FAILED: '/cashback/retry-failed',
      NOTIFY: '/cashback',
      WORKER_RUN: '/cashback/worker/run',
      WORKER_RUN_DATE_RANGE: '/cashback/worker/run-date-range',
      WORKER_STATS: '/cashback/worker/stats',
    },

    // Contas a Pagar
    PAYABLE_ACCOUNTS: {
      DASHBOARD: '/admin/payable-accounts/dashboard',
      LIST: '/admin/payable-accounts',
      CREATE: '/admin/payable-accounts',
      GET: '/admin/payable-accounts',
      UPDATE: '/admin/payable-accounts',
      APPROVE: '/admin/payable-accounts',
      PAYMENT: '/admin/payable-accounts',
      CANCEL: '/admin/payable-accounts',
      AUTO_GENERATE: '/admin/payable-accounts/auto-generate',
      BULK_APPROVE: '/admin/payable-accounts/bulk-approve',
      BULK_PAYMENT: '/admin/payable-accounts/bulk-payment',
      SUMMARY: '/admin/payable-accounts/summary',
      OVERDUE: '/admin/payable-accounts/overdue',
    },

    // Relatórios de Pagamento (PDF)
    PAYMENT_REPORT: {
      GENERATE_PDF: '/admin/stores',  // Base: /admin/stores/{store_id}/payment-report/pdf
    },
  },
}

// Helper function para construir URLs completas
export const buildApiUrl = (
  endpoint: string,
  params?: Record<string, string | number>
) => {
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
