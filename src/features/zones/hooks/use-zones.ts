import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { villamarketApi } from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import type {
  Zone,
  ZoneFormValues,
  ZoneModulePayload,
  ModuleZone,
} from '../data/schema'

interface PaginatedZones {
  items: Zone[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── List (paginated) ───
export function useZones(page = 1, limit = 25, search = '') {
  return useQuery<PaginatedZones>({
    queryKey: ['zones', { page, limit, search }],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit }
      if (search) params.search = search
      const r = await villamarketApi.get(VM_API.ENDPOINTS.ZONES.LIST, {
        params,
      })
      return r.data
    },
  })
}

// ─── Single ───
export function useZone(id: string) {
  return useQuery<Zone>({
    queryKey: ['zones', id],
    queryFn: async () => {
      const r = await villamarketApi.get(VM_API.ENDPOINTS.ZONES.GET(id))
      return r.data
    },
    enabled: !!id,
  })
}

// ─── Create ───
export function useCreateZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: ZoneFormValues) => {
      const r = await villamarketApi.post(VM_API.ENDPOINTS.ZONES.CREATE, data)
      return r.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['zones'] })
      toast.success('Zona criada com sucesso!')
    },
    onError: () => toast.error('Erro ao criar zona'),
  })
}

// ─── Update ───
export function useUpdateZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<ZoneFormValues>
    }) => {
      const r = await villamarketApi.patch(
        VM_API.ENDPOINTS.ZONES.UPDATE(id),
        data,
      )
      return r.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['zones'] })
      toast.success('Zona atualizada com sucesso!')
    },
    onError: () => toast.error('Erro ao atualizar zona'),
  })
}

// ─── Delete ───
export function useDeleteZone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await villamarketApi.delete(VM_API.ENDPOINTS.ZONES.DELETE(id))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['zones'] })
      toast.success('Zona removida com sucesso!')
    },
    onError: () => toast.error('Erro ao remover zona'),
  })
}

// ─── Toggle Active ───
export function useToggleZoneActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const r = await villamarketApi.patch(
        VM_API.ENDPOINTS.ZONES.TOGGLE_ACTIVE(id),
      )
      return r.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['zones'] })
      toast.success('Status da zona atualizado!')
    },
  })
}

// ─── Zone Modules ───
export function useZoneModules(zoneId: string) {
  return useQuery<ModuleZone[]>({
    queryKey: ['zones', zoneId, 'modules'],
    queryFn: async () => {
      const r = await villamarketApi.get(
        VM_API.ENDPOINTS.ZONES.MODULES(zoneId),
      )
      return r.data
    },
    enabled: !!zoneId,
  })
}

export function useSyncZoneModules() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      zoneId,
      modules,
    }: {
      zoneId: string
      modules: ZoneModulePayload[]
    }) => {
      const r = await villamarketApi.put(
        VM_API.ENDPOINTS.ZONES.MODULES(zoneId),
        { modules },
      )
      return r.data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['zones', vars.zoneId, 'modules'] })
      qc.invalidateQueries({ queryKey: ['zones'] })
      toast.success('Módulos da zona atualizados!')
    },
    onError: () => toast.error('Erro ao atualizar módulos da zona'),
  })
}
