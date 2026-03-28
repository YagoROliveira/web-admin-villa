import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'

// ─── Types ───

export interface UserDetail {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatarUrl: string | null
  role: string
  isEmailVerified: boolean
  isPhoneVerified: boolean
  isActive: boolean
  walletBalance: number
  loyaltyPoints: number
  referralCode: string | null
  referredById: string | null
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  addresses: Address[]
  _count: {
    orders: number
    reviews: number
    walletTxns: number
  }
}

export interface Address {
  id: string
  userId: string
  label: string | null
  address: string
  latitude: number
  longitude: number
  zoneId: string | null
  contactPerson: string | null
  contactPhone: string | null
  isDefault: boolean
}

export interface WalletTransaction {
  id: string
  userId: string
  type: string
  credit: number
  debit: number
  balance: number
  referenceType: string | null
  referenceId: string | null
  adminBonus: number
  createdAt: string
}

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  imageUrl: string | null
}

export interface UserOrder {
  id: string
  trackingId: string
  status: string
  orderType: string
  paymentMethod: string
  paymentStatus: string
  amounts: Record<string, number>
  deliveryCharge: number
  createdAt: string
  store: { id: string; name: string; logoUrl: string | null } | null
  items: OrderItem[]
}

export interface UserStats {
  totalOrders: number
  totalSpent: number
  avgOrderValue: number
  paymentMethods: { method: string; count: number }[]
  ordersByStatus: { status: string; count: number }[]
  lastOrderAt: string | null
  lastOrderStore: string | null
  favoriteStore: string | null
  favoriteStoreOrders: number
}

export interface TopItem {
  itemId: string | null
  name: string
  totalQuantity: number
  orderCount: number
  item: { id: string; name: string; imageUrl: string | null; price: number } | null
}

export interface Conversation {
  id: string
  type: string
  updatedAt: string
  participants: {
    userId: string
    user: { id: string; name: string; avatarUrl: string | null }
  }[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Hook: get full user detail ───

export function useUserDetail(userId: string) {
  return useQuery<UserDetail>({
    queryKey: ['user-detail', userId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.GET(userId))
      return data
    },
    enabled: !!userId,
  })
}

// ─── Hook: user statistics ───

export function useUserStats(userId: string) {
  return useQuery<UserStats>({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.STATS(userId))
      return data
    },
    enabled: !!userId,
  })
}

// ─── Hook: user orders (paginated) ───

export function useUserOrders(userId: string, page = 1, limit = 10) {
  return useQuery<PaginatedResponse<UserOrder>>({
    queryKey: ['user-orders', userId, page, limit],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.ORDERS(userId), {
        params: { page, limit },
      })
      return data
    },
    enabled: !!userId,
  })
}

// ─── Hook: user wallet transactions (paginated) ───

export function useUserWallet(userId: string, page = 1, limit = 15) {
  return useQuery<PaginatedResponse<WalletTransaction>>({
    queryKey: ['user-wallet', userId, page, limit],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.WALLET(userId), {
        params: { page, limit },
      })
      return data
    },
    enabled: !!userId,
  })
}

// ─── Hook: user addresses ───

export function useUserAddresses(userId: string) {
  return useQuery<Address[]>({
    queryKey: ['user-addresses', userId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.ADDRESSES(userId))
      return data
    },
    enabled: !!userId,
  })
}

// ─── Hook: update address ───

export function useUpdateAddress(userId: string) {
  const queryClient = useQueryClient()
  return useMutation<Address, Error, { addressId: string; data: Partial<Address> }>({
    mutationFn: async ({ addressId, data: dto }) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.USERS.UPDATE_ADDRESS(userId, addressId),
        dto,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses', userId] })
      queryClient.invalidateQueries({ queryKey: ['user-detail', userId] })
      toast.success('Endereço atualizado com sucesso!')
    },
    onError: (error) => toast.error(error.message || 'Erro ao atualizar endereço'),
  })
}

// ─── Hook: set default address ───

export function useSetDefaultAddress(userId: string) {
  const queryClient = useQueryClient()
  return useMutation<Address[], Error, string>({
    mutationFn: async (addressId) => {
      const { data } = await villamarketApi.patch(
        VM_API.ENDPOINTS.USERS.SET_DEFAULT_ADDRESS(userId, addressId),
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses', userId] })
      queryClient.invalidateQueries({ queryKey: ['user-detail', userId] })
      toast.success('Endereço principal definido!')
    },
    onError: (error) => toast.error(error.message || 'Erro ao definir endereço principal'),
  })
}

// ─── Hook: user conversations ───

export function useUserConversations(userId: string) {
  return useQuery<Conversation[]>({
    queryKey: ['user-conversations', userId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.CONVERSATIONS(userId))
      return data
    },
    enabled: !!userId,
  })
}

// ─── Hook: user access logs ───

export function useUserAccessLogs(userId: string) {
  return useQuery({
    queryKey: ['user-access-logs', userId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.ACCESS_LOGS(userId))
      return data
    },
    enabled: !!userId,
  })
}

// ─── Hook: user top items ───

export function useUserTopItems(userId: string) {
  return useQuery<TopItem[]>({
    queryKey: ['user-top-items', userId],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.USERS.TOP_ITEMS(userId))
      return data
    },
    enabled: !!userId,
  })
}

// ─── Hook: add funds to wallet ───

export function useAddFund(userId: string) {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, { amount: number; reference?: string }>({
    mutationFn: async (dto) => {
      const { data } = await villamarketApi.post(VM_API.ENDPOINTS.USERS.ADD_FUND(userId), dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wallet', userId] })
      queryClient.invalidateQueries({ queryKey: ['user-detail', userId] })
      toast.success('Saldo adicionado com sucesso!')
    },
    onError: (error) => toast.error(error.message || 'Erro ao adicionar saldo'),
  })
}
