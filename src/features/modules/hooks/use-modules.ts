import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { villamarketApi } from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import type { Module, ModuleFormValues } from '../data/schema'

interface PaginatedModules {
  items: Module[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── List (paginated) ───
export function useModules(page = 1, limit = 25, search = '') {
  return useQuery<PaginatedModules>({
    queryKey: ['modules', { page, limit, search }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit }
      if (search) params.search = search
      const r = await villamarketApi.get(VM_API.ENDPOINTS.MODULES.LIST, { params })
      return r.data
    },
  })
}

// ─── Single ───
export function useModule(id: string) {
  return useQuery<Module>({
    queryKey: ['modules', id],
    queryFn: async () => {
      const r = await villamarketApi.get(VM_API.ENDPOINTS.MODULES.GET(id))
      return r.data
    },
    enabled: !!id,
  })
}

// ─── Create ───
export function useCreateModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<ModuleFormValues>) => {
      const r = await villamarketApi.post(VM_API.ENDPOINTS.MODULES.CREATE, data)
      return r.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Módulo criado com sucesso!')
    },
    onError: () => toast.error('Erro ao criar módulo'),
  })
}

// ─── Update ───
export function useUpdateModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ModuleFormValues> }) => {
      const r = await villamarketApi.patch(VM_API.ENDPOINTS.MODULES.UPDATE(id), data)
      return r.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Módulo atualizado com sucesso!')
    },
    onError: () => toast.error('Erro ao atualizar módulo'),
  })
}

// ─── Delete ───
export function useDeleteModule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await villamarketApi.delete(VM_API.ENDPOINTS.MODULES.DELETE(id))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Módulo removido com sucesso!')
    },
    onError: () => toast.error('Erro ao remover módulo'),
  })
}

// ─── Toggle Active ───
export function useToggleModuleActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await villamarketApi.patch(VM_API.ENDPOINTS.MODULES.TOGGLE_ACTIVE(id))
      return r.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['modules'] })
      toast.success('Status atualizado!')
    },
  })
}
