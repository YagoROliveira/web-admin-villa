import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import api, { phpApi } from '@/lib/api'
import villamarketApi from '@/lib/villamarket-api'
import type { Order, OrderStats, OrderDetailResponse } from '../data/schema'

// ─── Types ───────────────────────────────────────────────────────────

export interface OrdersResponse {
  orders: Order[]
  total_orders: number
  limit: number
  offset: number
}

export interface PhpOrdersResponse {
  orders: Order[]
  total: number
  lastPage: number
  currentPage: number
  perPage: number
}

// ─── NestJS Backend: list orders by status ──────────────────────────

/** Calls GET /admin/stores/orders-with-costs on the NestJS backend, filtered by status */
export function usePhpOrders(status = 'all', page = 1, search = '') {
  const limit = 25
  const offset = (page - 1) * limit

  return useQuery<PhpOrdersResponse>({
    queryKey: ['php-orders', status, page, search],
    queryFn: async () => {
      const params: Record<string, string> = {
        limit: String(limit),
        offset: String(offset),
      }
      // 'all' / 'ALL' / '' → no status filter
      if (status && status !== 'all' && status !== 'ALL') {
        params.order_status = status
      }
      if (search) params.search = search

      const { data } = await api.get('/admin/stores/orders-with-costs', { params })
      const total = Number(data.total_orders ?? 0)
      return {
        orders: (data.orders ?? []) as Order[],
        total,
        lastPage: Math.ceil(total / limit) || 1,
        currentPage: page,
        perPage: limit,
      }
    },
    staleTime: 15_000,
  })
}

/** Fetches order counts per status from NestJS (lightweight — limit:1 each) */
export function useOrderStatusCounts() {
  const statuses = [
    'all', 'scheduled', 'pending', 'accepted', 'processing',
    'item_on_the_way', 'delivered', 'canceled', 'failed', 'refunded', 'requested',
  ] as const

  return useQuery<Record<string, number>>({
    queryKey: ['order-status-counts'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        statuses.map((s) => {
          const params: Record<string, string> = { limit: '1', offset: '0' }
          if (s !== 'all') params.order_status = s
          return api
            .get('/admin/stores/orders-with-costs', { params })
            .then((r) => Number(r.data.total_orders ?? 0))
        })
      )
      const counts: Record<string, number> = {}
      statuses.forEach((s, i) => {
        const r = results[i]
        counts[s] = r.status === 'fulfilled' ? r.value : 0
      })
      return counts
    },
    staleTime: 60_000,
  })
}

// ─── Queries ─────────────────────────────────────────────────────────

/** Admin: list all orders */
export function useOrders(
  page = 1,
  limit = 25,
  search = '',
  filters?: { storeId?: string; status?: string },
  enabled = true
) {
  const offset = (page - 1) * limit

  return useQuery<OrdersResponse>({
    queryKey: ['orders', page, limit, search, filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        limit: limit.toString(),
        offset: offset.toString(),
      }
      if (search) params.search = search
      if (filters?.storeId) params.store_id = filters.storeId
      if (filters?.status) params.order_status = filters.status
      const { data } = await api.get('/admin/stores/orders-with-costs', { params })
      return data
    },
    enabled,
    staleTime: 15_000,
  })
}

/** Vendor: list orders for a specific store */
export function useStoreOrders(
  storeId: string,
  page = 1,
  limit = 25,
  search = ''
) {
  const offset = (page - 1) * limit

  return useQuery<OrdersResponse>({
    queryKey: ['orders', 'store', storeId, page, limit, search],
    queryFn: async () => {
      const params: Record<string, string> = {
        limit: limit.toString(),
        offset: offset.toString(),
        store_id: storeId,
      }
      if (search) params.search = search
      const { data } = await api.get('/admin/stores/orders-with-costs', { params })
      return data
    },
    enabled: !!storeId,
    staleTime: 15_000,
  })
}

/** Stats: returns counts per status (no separate endpoint — disabled) */
export function useOrderStats(_storeId?: string) {
  return useQuery<OrderStats>({
    queryKey: ['orders', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stores/orders-with-costs', {
        params: { limit: '1', offset: '0' },
      })
      return {
        total: data.total_orders ?? 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        delivered: 0,
        canceled: 0,
      }
    },
    staleTime: 60_000,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────

/** Change order status (e.g., pending → accepted → delivered → canceled) */
export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation<void, Error, { orderId: string; orderStatus: string; reason?: string; processingTime?: number }>({
    mutationFn: async ({ orderId, orderStatus, reason, processingTime }) => {
      const params: Record<string, string> = {
        id: orderId,
        order_status: orderStatus,
      }
      if (reason) params.reason = reason
      if (processingTime) params.processing_time = String(processingTime)
      await api.get('/order/status', { params })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Status do pedido atualizado!')
    },
    onError: () => {
      toast.error('Erro ao atualizar status')
    },
  })
}

/** Change payment status only (paid / unpaid) */
export function useUpdatePaymentStatus() {
  const qc = useQueryClient()
  return useMutation<void, Error, { orderId: string; paymentStatus: string }>({
    mutationFn: async ({ orderId, paymentStatus }) => {
      await api.get('/admin/order/payment-status', {
        params: { order_id: orderId, payment_status: paymentStatus },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Status de pagamento atualizado!')
    },
    onError: () => {
      toast.error('Erro ao atualizar status de pagamento')
    },
  })
}

/** Assign delivery man */
export function useAssignDeliveryMan() {
  const qc = useQueryClient()
  return useMutation<void, Error, { orderId: string; deliveryManId: string }>({
    mutationFn: async ({ orderId, deliveryManId }) => {
      await api.get(`/order/add-delivery-man/${orderId}/${deliveryManId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Entregador atribuído!')
    },
    onError: () => {
      toast.error('Erro ao atribuir entregador')
    },
  })
}

/** Cancel order */
export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation<void, Error, { orderId: string; reason?: string }>({
    mutationFn: async ({ orderId, reason }) => {
      const params: Record<string, string> = { id: orderId, order_status: 'canceled' }
      if (reason) params.reason = reason
      await api.get('/order/status', { params })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Pedido cancelado')
    },
    onError: () => {
      toast.error('Erro ao cancelar pedido')
    },
  })
}

/** Add transaction reference code to an order */
export function useAddPaymentRef() {
  const qc = useQueryClient()
  return useMutation<void, Error, { orderId: string; transactionReference: string }>({
    mutationFn: async ({ orderId, transactionReference }) => {
      await api.post(`/order/add-payment-ref-code/${orderId}`, {
        transaction_reference: transactionReference,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Referência de pagamento adicionada!')
    },
    onError: () => {
      toast.error('Erro ao adicionar referência')
    },
  })
}

/** Single order detail — reads from TanStack Query cache, falls back to list endpoint */
export function useOrder(orderId: string) {
  const qc = useQueryClient()

  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      // 1) Try to find the order in any already-cached page
      const allQueries = qc.getQueriesData<OrdersResponse>({ queryKey: ['orders'] })
      for (const [, data] of allQueries) {
        if (data?.orders) {
          const found = data.orders.find((o) => String(o.id) === String(orderId))
          if (found) return found
        }
      }
      // 2) Fallback: fetch a wide page and search within it
      const { data } = await api.get('/admin/stores/orders-with-costs', {
        params: { limit: '200', offset: '0' },
      })
      const found = (data.orders as Order[]).find(
        (o) => String(o.id) === String(orderId)
      )
      if (!found) throw new Error('Pedido não encontrado')
      return found
    },
    enabled: !!orderId,
    staleTime: 15_000,
  })
}

/** Update order amounts (stub — not supported by this API) */
export function useUpdateOrderAmounts() {
  return useMutation<void, Error, { orderId: string; amounts: Record<string, number> }>({
    mutationFn: async () => {
      toast.info('Atualização de valores não disponível nesta versão da API')
    },
  })
}

/** Update order note (stub — not supported by this API) */
export function useUpdateOrderNote() {
  return useMutation<void, Error, { orderId: string; note: string }>({
    mutationFn: async () => {
      toast.info('Atualização de observação não disponível nesta versão da API')
    },
  })
}

// ─── Order Detail (full: items, delivery man, customer, store) ────────

/**
 * Builds an OrderDetailResponse from a raw order object returned by orders-with-costs.
 * Used as fallback when the detail endpoint is unavailable.
 */
function buildDetailFromOrder(raw: any): OrderDetailResponse {
  // Build customer from nested object or flat fields
  const customer =
    raw.customer ??
    (raw.customer_name || raw.customer_phone || raw.customer_email
      ? {
          id: raw.user_id ?? '',
          f_name: raw.customer_name?.split(' ')[0] ?? null,
          l_name: raw.customer_name?.split(' ').slice(1).join(' ') || null,
          phone: raw.customer_phone ?? null,
          email: raw.customer_email ?? null,
          image: null,
        }
      : null)
  // Build delivery_man from nested object or flat fields (orders-with-costs may include these)
  const delivery_man =
    raw.delivery_man ??
    raw.deliveryman ??
    (raw.delivery_man_id && (raw.delivery_man_name || raw.dm_name || raw.delivery_man_phone || raw.dm_phone)
      ? {
          id: raw.delivery_man_id,
          f_name: (raw.delivery_man_name ?? raw.dm_name ?? '').split(' ')[0] || null,
          l_name: (raw.delivery_man_name ?? raw.dm_name ?? '').split(' ').slice(1).join(' ') || null,
          phone: raw.delivery_man_phone ?? raw.dm_phone ?? null,
          email: raw.delivery_man_email ?? raw.dm_email ?? null,
          image: raw.delivery_man_image ?? raw.dm_image ?? null,
        }
      : null)
  return {
    order: raw,
    details: raw.details ?? raw.order_details ?? raw.orderDetails ?? [],
    delivery_man,
    customer,
    store: raw.store ?? null,
    offline_payments: raw.offline_payments ?? null,
    refund: raw.refund ?? null,
  }
}

/** Fetches delivery man details by ID, trying multiple API endpoints */
export function useDeliveryManById(dmId: string | number | null | undefined) {
  return useQuery<any>({
    queryKey: ['delivery-man', String(dmId)],
    queryFn: async () => {
      const apiEndpoints = [
        `/admin/delivery-man/${dmId}`,
        `/admin/delivery-men/${dmId}`,
        `/admin/delivery-man/details/${dmId}`,
        `/admin/user/${dmId}`,
        `/admin/users/${dmId}`,
        `/delivery-man/${dmId}`,
        `/delivery-men/${dmId}`,
      ]
      for (const ep of apiEndpoints) {
        try {
          const { data } = await api.get(ep)
          if (data && (data.f_name || data.name || data.email || data.phone || data.image || data.id)) {
            // Normalise to a consistent shape
            return {
              id: data.id ?? dmId,
              f_name: data.f_name ?? data.name?.split(' ')[0] ?? null,
              l_name: data.l_name ?? data.name?.split(' ').slice(1).join(' ') ?? null,
              phone: data.phone ?? null,
              email: data.email ?? null,
              image: data.image ?? data.avatar ?? data.avatarUrl ?? null,
              delivered_order: data.delivered_order ?? data.order_count ?? null,
            }
          }
        } catch { /* try next */ }
      }
      // Try VillaMarket NestJS API (/v1/users/{id})
      try {
        const { data } = await villamarketApi.get(`/v1/users/${dmId}`)
        if (data) {
          return {
            id: data.id ?? dmId,
            f_name: data.f_name ?? data.name?.split(' ')[0] ?? null,
            l_name: data.l_name ?? data.name?.split(' ').slice(1).join(' ') ?? null,
            phone: data.phone ?? data.contactPhone ?? null,
            email: data.email ?? null,
            image: data.image ?? data.avatarUrl ?? data.imageUrl ?? null,
            delivered_order: data.delivered_order ?? data.deliveredOrders ?? null,
          }
        }
      } catch { /* not found */ }
      return null
    },
    enabled: !!dmId,
    staleTime: 120_000,
    retry: false,
  })
}

export function useOrderDetail(orderId: string | undefined, storeIdProp?: string) {
  const qc = useQueryClient()

  return useQuery<OrderDetailResponse>({
    queryKey: ['order', 'detail', orderId, storeIdProp],
    queryFn: async () => {
      // Helper: extract a valid OrderDetailResponse from a raw response object
      function extractDetail(data: any): OrderDetailResponse | null {
        if (!data) return null
        if (data.order || Array.isArray(data.details)) {
          return {
            order: data.order ?? {},
            details: data.details ?? [],
            delivery_man: data.delivery_man ?? null,
            customer: data.customer ?? null,
            store: data.store ?? data.restaurant ?? null,
            offline_payments: data.offline_payments ?? null,
            refund: data.refund ?? null,
          } as OrderDetailResponse
        }
        if (data.id && (data.details || data.order_details || data.orderDetails)) {
          return {
            order: data,
            details: data.details ?? data.order_details ?? data.orderDetails ?? [],
            delivery_man: data.delivery_man ?? data.deliveryman ?? null,
            customer: data.customer ?? null,
            store: data.store ?? data.restaurant ?? null,
            offline_payments: data.offline_payments ?? null,
            refund: data.refund ?? null,
          } as OrderDetailResponse
        }
        return null
      }

      // 1) Try PHP backend first (canonical source — has items, delivery_man, customer, store)
      const detailEndpoints = [
        () => phpApi.get(`/order/details/${orderId}`),
        () => phpApi.get(`/api/v1/order/details/${orderId}`),
        () => api.get(`/admin/order/details/${orderId}`),
        () => api.get(`/admin/stores/orders/${orderId}`),
        () => api.get(`/admin/order/${orderId}`),
      ]
      for (const attempt of detailEndpoints) {
        try {
          const { data } = await attempt()
          const result = extractDetail(data)
          if (result) return result
        } catch { /* try next */ }
      }

      // 2) Check cache from useOrder
      const cached = qc.getQueryData<Order>(['order', orderId])
      if (cached) return buildDetailFromOrder(cached)

      // 3) Check any orders list in cache
      const allPages = qc.getQueriesData<OrdersResponse>({ queryKey: ['orders'] })
      for (const [, page] of allPages) {
        if (page?.orders) {
          const found = page.orders.find((o) => String(o.id) === String(orderId))
          if (found) return buildDetailFromOrder(found)
        }
      }

      // 4) Fetch from orders-with-costs (has financial data, no items)
      try {
        const { data } = await api.get('/admin/stores/orders-with-costs', {
          params: { order_id: orderId, limit: '1', offset: '0' },
        })
        const orders: Order[] = data?.orders ?? (Array.isArray(data) ? data : [])
        const found = orders.find((o) => String(o.id) === String(orderId))
        if (found) return buildDetailFromOrder(found as any)
      } catch { /* ignore */ }

      return {} as OrderDetailResponse
    },
    enabled: !!orderId,
    staleTime: 30_000,
    retry: false,
  })
}
