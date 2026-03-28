import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import type { Order, OrderStats } from '../data/schema'

// ─── Types ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Queries ─────────────────────────────────────────────────────────

/** Admin: list all orders (with optional filters) */
export function useOrders(
  page = 1,
  limit = 25,
  search = '',
  filters?: { storeId?: string; status?: string },
  enabled = true
) {
  return useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', page, limit, search, filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }
      if (search) params.search = search
      if (filters?.storeId) params.storeId = filters.storeId
      if (filters?.status) params.status = filters.status
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.ORDERS.LIST, {
        params,
      })
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
  return useQuery<PaginatedResponse<Order>>({
    queryKey: ['orders', 'store', storeId, page, limit, search],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      }
      if (search) params.search = search
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.ORDERS.BY_STORE(storeId),
        { params }
      )
      return data
    },
    enabled: !!storeId,
    staleTime: 15_000,
  })
}

/** Single order detail */
export function useOrder(orderId: string) {
  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.ORDERS.GET(orderId)
      )
      return data
    },
    enabled: !!orderId,
  })
}

/** Order stats (optionally for a store) */
export function useOrderStats(storeId?: string) {
  return useQuery<OrderStats>({
    queryKey: ['orders', 'stats', storeId],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (storeId) params.storeId = storeId
      const { data } = await villamarketApi.get(
        VM_API.ENDPOINTS.ORDERS.STATS,
        { params }
      )
      return data
    },
    staleTime: 30_000,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────

/** Update order status */
export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation<
    Order,
    Error,
    { orderId: string; status: string; reason?: string }
  >({
    mutationFn: async ({ orderId, status, reason }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
        { status, reason }
      )
      return data
    },
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      toast.success('Status do pedido atualizado!')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Erro ao atualizar status'
      )
    },
  })
}

/** Assign delivery man */
export function useAssignDeliveryMan() {
  const qc = useQueryClient()
  return useMutation<
    Order,
    Error,
    { orderId: string; deliveryManId: string }
  >({
    mutationFn: async ({ orderId, deliveryManId }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ORDERS.ASSIGN_DM(orderId),
        { deliveryManId }
      )
      return data
    },
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      toast.success('Entregador atribuído!')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Erro ao atribuir entregador'
      )
    },
  })
}

/** Cancel order */
export function useCancelOrder() {
  const qc = useQueryClient()
  return useMutation<Order, Error, { orderId: string; reason: string }>({
    mutationFn: async ({ orderId, reason }) => {
      const { data } = await villamarketApi.post(
        VM_API.ENDPOINTS.ORDERS.CANCEL(orderId),
        { reason }
      )
      return data
    },
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      toast.success('Pedido cancelado')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Erro ao cancelar pedido'
      )
    },
  })
}

/** Update order amounts */
export function useUpdateOrderAmounts() {
  const qc = useQueryClient()
  return useMutation<
    Order,
    Error,
    {
      orderId: string
      amounts: {
        subtotal?: number
        tax?: number
        deliveryFee?: number
        discount?: number
        couponDiscount?: number
        tips?: number
        extraPackaging?: number
        total?: number
      }
    }
  >({
    mutationFn: async ({ orderId, amounts }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ORDERS.UPDATE_AMOUNTS(orderId),
        amounts
      )
      return data
    },
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      toast.success('Valores do pedido atualizados!')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Erro ao atualizar valores'
      )
    },
  })
}

/** Update order note */
export function useUpdateOrderNote() {
  const qc = useQueryClient()
  return useMutation<Order, Error, { orderId: string; note: string }>({
    mutationFn: async ({ orderId, note }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.ORDERS.UPDATE_NOTE(orderId),
        { note }
      )
      return data
    },
    onSuccess: (_data, { orderId }) => {
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order', orderId] })
      toast.success('Observação atualizada!')
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Erro ao atualizar observação'
      )
    },
  })
}
