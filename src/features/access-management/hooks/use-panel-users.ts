import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import type {
  PanelUser,
  UpdateUserRolePayload,
  InviteUserPayload,
} from '../data/schema'

const PANEL_USERS_KEY = ['panel-users']

/** Safely extract role name string from a role value that may be an object */
function safeRoleStr(role: unknown): string {
  if (typeof role === 'string') return role
  if (typeof role === 'object' && role !== null && 'name' in role) return String((role as any).name)
  return String(role ?? 'ADMIN')
}

/** Safely extract permissions array from a value that may be an object */
function safePermissions(perms: unknown): string[] {
  if (Array.isArray(perms)) return perms
  if (typeof perms === 'object' && perms !== null) {
    return Object.entries(perms).filter(([, v]) => v === true).map(([k]) => k)
  }
  return []
}

/** Normalize an admin record from the API to ensure role is a string and permissions is an array */
function normalizeUser(user: any): PanelUser {
  return {
    ...user,
    role: safeRoleStr(user.role),
    permissions: safePermissions(user.permissions ?? (typeof user.role === 'object' ? user.role?.permissions : undefined)),
  }
}

// ─── Fetch all admin/panel users (NestJS /v1/admin) ───

export function usePanelUsers(page = 1, pageSize = 25) {
  return useQuery<{
    users: PanelUser[]
    pagination: { total: number; page: number; pageSize: number; totalPages: number }
  }>({
    queryKey: [...PANEL_USERS_KEY, page, pageSize],
    queryFn: async () => {
      const { data } = await villamarketApi.get(VM_API.ENDPOINTS.ADMIN.LIST, {
        params: { page, limit: pageSize },
      })

      // NestJS returns { items, total, page, limit, totalPages }
      // Normalize to { users, pagination }
      if (data.items) {
        return {
          users: data.items.map(normalizeUser),
          pagination: {
            total: data.total,
            page: data.page,
            pageSize: data.limit,
            totalPages: data.totalPages,
          },
        }
      }

      // If already { users, pagination }
      if (data.users) {
        return {
          ...data,
          users: data.users.map(normalizeUser),
        }
      }

      return data
    },
    staleTime: 30_000,
  })
}

// ─── Update a user's role ───

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, UpdateUserRolePayload>({
    mutationFn: async (payload) => {
      await villamarketApi.patch(VM_API.ENDPOINTS.ADMIN.UPDATE(payload.userId), {
        role: payload.role,
        permissions: payload.permissions,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PANEL_USERS_KEY })
      toast.success('Permissões atualizadas com sucesso')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar permissões')
    },
  })
}

// ─── Invite / create a new admin user ───

export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, InviteUserPayload>({
    mutationFn: async (payload) => {
      await villamarketApi.post(VM_API.ENDPOINTS.ADMIN.CREATE, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PANEL_USERS_KEY })
      toast.success('Usuário criado com sucesso')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao criar usuário')
    },
  })
}

// ─── Revoke access (delete admin user) ───

export function useRevokeAccess() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (userId) => {
      await villamarketApi.delete(VM_API.ENDPOINTS.ADMIN.DELETE(userId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PANEL_USERS_KEY })
      toast.success('Acesso revogado com sucesso')
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao revogar acesso')
    },
  })
}
