import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import villamarketApi from '@/lib/villamarket-api'
import { VM_API } from '@/config/api'
import type { ComboboxOption } from '@/components/searchable-combobox'

// ─── Generic paginated response ──────────────────────────────────────

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Helper to build a lookup hook ───────────────────────────────────

function useLookup<T>(
  queryKey: string,
  endpoint: string,
  mapFn: (item: T) => ComboboxOption,
  search: string,
) {
  const query = useQuery<PaginatedResponse<T>>({
    queryKey: [queryKey, 'lookup', search],
    queryFn: async () => {
      const params: Record<string, string> = { limit: '50' }
      if (search) params.search = search
      const { data } = await villamarketApi.get(endpoint, { params })
      return data
    },
    staleTime: 60_000,
  })

  const options: ComboboxOption[] = (query.data?.items ?? []).map(mapFn)

  return { options, isLoading: query.isLoading }
}

// ─── Vendor Lookup ──────────────────────────────────────────────────

interface VendorLookup {
  id: string
  name: string
  email?: string | null
  phone?: string | null
}

export function useVendorOptions(search = '') {
  return useLookup<VendorLookup>(
    'vendors',
    VM_API.ENDPOINTS.VENDORS.LIST,
    (v) => ({
      value: v.id,
      label: v.name,
      description: v.email ?? v.phone ?? undefined,
    }),
    search,
  )
}

// ─── Zone Lookup ────────────────────────────────────────────────────

interface ZoneLookup {
  id: string
  name: string
  displayName?: string | null
}

export function useZoneOptions(search = '') {
  return useLookup<ZoneLookup>(
    'zones',
    VM_API.ENDPOINTS.ZONES.LIST,
    (z) => ({
      value: z.id,
      label: z.displayName || z.name,
      description: z.displayName ? z.name : undefined,
    }),
    search,
  )
}

// ─── Module Lookup ──────────────────────────────────────────────────

interface ModuleLookup {
  id: string
  name: string
  type: string
}

export function useModuleOptions(search = '') {
  return useLookup<ModuleLookup>(
    'modules',
    VM_API.ENDPOINTS.MODULES.LIST,
    (m) => ({
      value: m.id,
      label: m.name,
      description: m.type,
    }),
    search,
  )
}

// ─── Category Lookup ────────────────────────────────────────────────

interface CategoryLookup {
  id: string
  name: string
  parent?: { name: string } | null
}

export function useCategoryOptions(search = '') {
  return useLookup<CategoryLookup>(
    'categories',
    VM_API.ENDPOINTS.CATEGORIES.LIST,
    (c) => ({
      value: c.id,
      label: c.name,
      description: c.parent?.name ? `em ${c.parent.name}` : undefined,
    }),
    search,
  )
}

// ─── Store Lookup ───────────────────────────────────────────────────

interface UnitLookup {
  id: string
  name: string
}

export function useUnitOptions(search = '') {
  return useLookup<UnitLookup>(
    'units',
    VM_API.ENDPOINTS.UNITS.LIST,
    (u) => ({
      value: u.id,
      label: u.name,
    }),
    search,
  )
}

// ─── Store Lookup ───────────────────────────────────────────────

interface StoreLookup {
  id: string
  name: string
  address?: string | null
}

export function useStoreOptions(search = '') {
  return useLookup<StoreLookup>(
    'stores',
    VM_API.ENDPOINTS.STORES.LIST,
    (s) => ({
      value: s.id,
      label: s.name,
      description: s.address ?? undefined,
    }),
    search,
  )
}

// ─── Hook that wraps a lookup with local debounced search ───────────

export function useLookupWithSearch(
  hookFn: (search: string) => { options: ComboboxOption[]; isLoading: boolean },
) {
  const [search, setSearch] = useState('')
  const { options, isLoading } = hookFn(search)
  return { options, isLoading, search, setSearch }
}
