import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { phpApi } from '@/lib/api'
import type { Item, ItemFormValues } from '../data/schema'

// ─── Types ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── PHP response normalizer ──────────────────────────────────────────

function normalizeItem(raw: any): Item {
  // category_ids is json: [{"id":1,"position":0},{"id":2,"position":1}]
  const catIds: Array<{ id: number; position: number }> = Array.isArray(raw.category_ids)
    ? raw.category_ids
    : (typeof raw.category_ids === 'string' ? JSON.parse(raw.category_ids || '[]') : [])
  const primaryCat = catIds.find((c) => c.position === 0) ?? catIds[0]

  return {
    id: String(raw.id),
    name: raw.name ?? '',
    slug: raw.slug ?? String(raw.id),
    description: raw.description ?? null,
    price: Number(raw.price ?? 0),
    discount: raw.discount != null
      ? { type: raw.discount_type ?? 'percent', amount: Number(raw.discount), maxDiscount: undefined }
      : null,
    tax: raw.tax != null ? Number(raw.tax) : null,
    availableFrom: raw.available_time_starts ?? null,
    availableTo: raw.available_time_ends ?? null,
    status: raw.status === 1,
    isActive: raw.status === 1,
    isApproved: raw.approved != null ? Boolean(raw.approved) : true,
    isVeg: raw.veg === 1,
    isHalal: Boolean(raw.halal),
    isOrganic: Boolean(raw.organic),
    isRecommended: raw.recommended === 1,
    isSetMenu: raw.set_menu === 1,
    categoryIds: catIds,
    addOnIds: Array.isArray(raw.add_on_ids) ? raw.add_on_ids : [],
    choiceOptions: raw.choice_options ?? null,
    variations: raw.variations ?? null,
    image: raw.image ?? null,
    images: Array.isArray(raw.images) ? raw.images
      : (typeof raw.images === 'string' ? JSON.parse(raw.images || '[]') : []),
    storeId: String(raw.store_id ?? ''),
    moduleId: String(raw.module_id ?? ''),
    unitId: raw.unit_id != null ? String(raw.unit_id) : null,
    stock: raw.stock != null ? Number(raw.stock) : null,
    maxCartQty: raw.maximum_cart_quantity != null ? Number(raw.maximum_cart_quantity) : null,
    brandId: raw.brand_id != null ? String(raw.brand_id) : null,
    avgRating: raw.rating != null ? Number(raw.rating) : null,
    ratingCount: raw.rating_count != null ? Number(raw.rating_count) : null,
    reviewCount: raw.rating_count != null ? Number(raw.rating_count) : null,
    orderCount: null,
    minPrice: null,
    maxPrice: null,
    categoryId: primaryCat ? String(primaryCat.id) : (raw.category_id ? String(raw.category_id) : ''),
    // Relations
    category: raw.category ? { id: String(raw.category.id), name: raw.category.name } : null,
    store: raw.store ? { id: String(raw.store.id), name: raw.store.name } : null,
    module: raw.module
      ? { id: String(raw.module.id), name: raw.module.module_type ?? raw.module.name ?? '', type: raw.module.module_type ?? '' }
      : null,
    unit: raw.unit ? { id: String(raw.unit.id), name: raw.unit.unit ?? raw.unit.name ?? '' } : null,
    addons: raw.add_ons ?? raw.addons ?? [],
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: any) => (typeof t === 'string' ? { tag: t } : t)) : [],
    translations: raw.translations ?? null,
    _count: undefined,
    createdAt: raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? new Date().toISOString(),
  }
}

function parsePaginatedResponse(data: any): PaginatedResponse<Item> {
  // Laravel paginated: { data: [...], current_page, per_page, total, last_page }
  if (data && Array.isArray(data.data)) {
    return {
      items: data.data.map(normalizeItem),
      total: data.total ?? data.data.length,
      page: data.current_page ?? 1,
      limit: data.per_page ?? 25,
      totalPages: data.last_page ?? 1,
    }
  }
  // Direct array
  if (Array.isArray(data)) {
    return { items: data.map(normalizeItem), total: data.length, page: 1, limit: data.length, totalPages: 1 }
  }
  return { items: [], total: 0, page: 1, limit: 25, totalPages: 1 }
}

// ─── Queries ─────────────────────────────────────────────────────────

export interface ItemFilters {
  search?: string
  category_id?: string
  store_id?: string
  module_id?: string
}

export function useItems(page = 1, limit = 25, search = '', filters?: ItemFilters) {
  return useQuery<PaginatedResponse<Item>>({
    queryKey: ['items', page, limit, search, filters],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (search) params.search = search
      if (filters?.category_id) params.category_id = filters.category_id
      if (filters?.store_id) params.store_id = filters.store_id
      if (filters?.module_id) params.module_id = filters.module_id
      const { data } = await phpApi.get('/item/list', { params })
      return parsePaginatedResponse(data)
    },
    staleTime: 30_000,
  })
}

export function useItem(itemId: string) {
  return useQuery<Item>({
    queryKey: ['item', itemId],
    queryFn: async () => {
      const { data } = await phpApi.get(`/item/edit/${itemId}`)
      // PHP returns the item directly (or wrapped in 'item' key)
      const raw = data?.item ?? data
      return normalizeItem(raw)
    },
    enabled: !!itemId,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────

function buildFormData(dto: ItemFormValues, itemId?: string): FormData {
  const fd = new FormData()
  if (itemId) fd.append('id', itemId)
  fd.append('name[0]', dto.name)
  if (dto.description) fd.append('description[0]', dto.description)
  fd.append('category_id', dto.categoryId)
  fd.append('store_id', dto.storeId)
  fd.append('module_id', dto.moduleId)
  if (dto.unitId) fd.append('unit_id', dto.unitId)
  fd.append('price', String(dto.price))
  fd.append('discount', String(dto.discount?.amount ?? 0))
  fd.append('discount_type', dto.discount?.type ?? 'percent')
  fd.append('tax', String(dto.tax ?? 0))
  fd.append('tax_type', 'percent')
  fd.append('status', dto.isActive ? '1' : '0')
  fd.append('veg', dto.isVeg ? '1' : '0')
  fd.append('recommended', dto.isRecommended ? '1' : '0')
  fd.append('set_menu', dto.isSetMenu ? '1' : '0')
  if (dto.stock != null) fd.append('current_stock', String(dto.stock))
  if (dto.maxCartQty) fd.append('maximum_cart_quantity', String(dto.maxCartQty))
  if (dto.availableFrom) fd.append('available_time_starts', dto.availableFrom)
  if (dto.availableTo) fd.append('available_time_ends', dto.availableTo)
  if (Array.isArray(dto.tags)) dto.tags.forEach((t) => fd.append('tag_ids[]', t))
  if (dto.variations) fd.append('variations', typeof dto.variations === 'string' ? dto.variations : JSON.stringify(dto.variations))
  if (dto.stockType) fd.append('stock_type', dto.stockType)
  if (dto.brandId) fd.append('brand_id', dto.brandId)
  return fd
}

export function useCreateItem() {
  const qc = useQueryClient()
  return useMutation<Item, Error, ItemFormValues>({
    mutationFn: async (dto) => {
      const fd = buildFormData(dto)
      const { data } = await phpApi.post('/item/store', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return normalizeItem(data?.item ?? data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success('Produto criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar produto')
    },
  })
}

export function useUpdateItem() {
  const qc = useQueryClient()
  return useMutation<Item, Error, { id: string; data: Partial<ItemFormValues> }>({
    mutationFn: async ({ id, data: dto }) => {
      const fd = buildFormData(dto as ItemFormValues, id)
      fd.append('_method', 'PUT') // Laravel method override if needed
      const { data } = await phpApi.post('/item/store', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return normalizeItem(data?.item ?? data)
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['item', variables.id] })
      toast.success('Produto atualizado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar produto')
    },
  })
}

export function useDeleteItem() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (itemId) => {
      await phpApi.delete(`/item/delete/${itemId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success('Produto removido com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover produto')
    },
  })
}

export function useToggleItemActive() {
  const qc = useQueryClient()
  return useMutation<void, Error, { id: string; currentStatus: boolean }>({
    mutationFn: async ({ id, currentStatus }) => {
      const newStatus = currentStatus ? 0 : 1
      await phpApi.get(`/item/status/${id}/${newStatus}`)
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['items'] })
      qc.invalidateQueries({ queryKey: ['item', vars.id] })
      toast.success('Status alterado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao alterar status')
    },
  })
}

export function useApproveItem() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (itemId) => {
      await phpApi.get('/item/approved', { params: { id: itemId } })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success('Produto aprovado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao aprovar produto')
    },
  })
}

export function useDenyItem() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (itemId) => {
      await phpApi.get('/item/product_denied', { params: { id: itemId } })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success('Produto negado.')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao negar produto')
    },
  })
}

// ─── Stock ───────────────────────────────────────────────────────────

export interface ItemStock {
  item_id: number
  variations: Array<{
    type: string
    price: number
    stock: number
    variant_index: number
  }>
}

export function useItemStock(itemId: string) {
  return useQuery<ItemStock>({
    queryKey: ['item', itemId, 'stock'],
    queryFn: async () => {
      const { data } = await phpApi.get('/item/get-stock', { params: { item_id: itemId } })
      return data
    },
    enabled: !!itemId,
  })
}

export function useUpdateItemStock() {
  const qc = useQueryClient()
  return useMutation<void, Error, { item_id: string; variant_index: number; stock: number }>({
    mutationFn: async (payload) => {
      await phpApi.post('/item/stock-update', payload)
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.item_id, 'stock'] })
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success('Estoque atualizado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar estoque')
    },
  })
}

// ─── Import / Export ─────────────────────────────────────────────────

export function useImportItems() {
  const qc = useQueryClient()
  return useMutation<void, Error, { file: File; store_id: string }>({
    mutationFn: async ({ file, store_id }) => {
      const fd = new FormData()
      fd.append('products_file', file)
      fd.append('store_id', store_id)
      await phpApi.post('/item/bulk-import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] })
      toast.success('Importação concluída!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao importar produtos')
    },
  })
}

export function exportItemsUrl(type = 'xlsx') {
  return `/item/export?type=${type}`
}

export function exportStoreItemsUrl(store_id: string) {
  return `/item/store-item-export?store_id=${store_id}`
}

// ─── Item Stats (falls back to derived data if PHP has no stats endpoint) ───

export interface ItemStats {
  orderCount: number
  reviewCount: number
  wishlistCount: number
  avgRating: number
  totalRevenue: number
  totalUnitsSold: number
}

export function useItemStats(itemId: string) {
  return useQuery<ItemStats>({
    queryKey: ['item', itemId, 'stats'],
    queryFn: async () => {
      // PHP may not have dedicated stats endpoint; return empty shape
      return {
        orderCount: 0,
        reviewCount: 0,
        wishlistCount: 0,
        avgRating: 0,
        totalRevenue: 0,
        totalUnitsSold: 0,
      }
    },
    enabled: !!itemId,
    staleTime: Infinity,
  })
}

// ─── Addons (kept for detail page compatibility) ──────────────────────

export function useSetItemAddons() {
  const qc = useQueryClient()
  return useMutation<void, Error, { itemId: string; addonIds: string[] }>({
    mutationFn: async ({ itemId, addonIds }) => {
      const fd = new FormData()
      fd.append('id', itemId)
      addonIds.forEach((id) => fd.append('addon_ids[]', id))
      await phpApi.post('/item/store', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.itemId] })
      toast.success('Complementos atualizados!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar complementos')
    },
  })
}

export function useAttachItemAddon() {
  const qc = useQueryClient()
  return useMutation<void, Error, { itemId: string; addonId: string }>({
    mutationFn: async ({ itemId, addonId }) => {
      const fd = new FormData()
      fd.append('id', itemId)
      fd.append('addon_ids[]', addonId)
      await phpApi.post('/item/store', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.itemId] })
      toast.success('Complemento adicionado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao adicionar complemento')
    },
  })
}

export function useDetachItemAddon() {
  const qc = useQueryClient()
  return useMutation<void, Error, { itemId: string; addonId: string }>({
    mutationFn: async ({ itemId, addonId }) => {
      const fd = new FormData()
      fd.append('id', itemId)
      fd.append('remove_addon_id', addonId)
      await phpApi.post('/item/store', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.itemId] })
      toast.success('Complemento removido!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover complemento')
    },
  })
}

export function useUpdateItemVariations() {
  const qc = useQueryClient()
  return useMutation<void, Error, { itemId: string; variations: any }>({
    mutationFn: async ({ itemId, variations }) => {
      const fd = new FormData()
      fd.append('id', itemId)
      fd.append('variations', JSON.stringify(variations))
      await phpApi.post('/item/store', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['item', vars.itemId] })
      toast.success('Variações atualizadas!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar variações')
    },
  })
}

