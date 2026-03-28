import { z } from 'zod'

// ─── Related entities (nested from API) ──────────────────────────────

const vendorSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
})

const moduleSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
})

const zoneSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string().nullable().optional(),
})

const scheduleSchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  day: z.number().min(0).max(6),
  openTime: z.string(),
  closeTime: z.string(),
})

const storeConfigSchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  minStockWarning: z.number().optional(),
  halalTagEnabled: z.boolean().optional(),
  extraPackagingEnabled: z.boolean().optional(),
  extraPackagingAmount: z.number().optional(),
}).nullable().optional()

const storeDiscountSchema = z.object({
  id: z.string().optional(),
  storeId: z.string().optional(),
  type: z.string().optional(),
  discount: z.number().optional(),
  minPurchase: z.number().optional(),
  maxDiscount: z.number().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
}).nullable().optional()

// ─── Store schema ────────────────────────────────────────────────────

export const storeSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  vendorId: z.string(),
  moduleId: z.string(),
  zoneId: z.string(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  logoUrl: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  minOrder: z.number().nullable().optional(),
  commissionRate: z.number().nullable().optional(),
  taxRate: z.number().nullable().optional(),
  gstCode: z.string().nullable().optional(),
  deliveryConfig: z.any().nullable().optional(),
  features: z.any().nullable().optional(),
  offDays: z.array(z.string()).nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  metaImage: z.string().nullable().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isApproved: z.boolean(),
  announcement: z.any().nullable().optional(),
  avgRating: z.number().nullable().optional(),
  totalReviews: z.number().nullable().optional(),
  totalOrders: z.number().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Relations
  vendor: vendorSummarySchema.nullable().optional(),
  module: moduleSummarySchema.nullable().optional(),
  zone: zoneSummarySchema.nullable().optional(),
  schedules: z.array(scheduleSchema).optional(),
  config: storeConfigSchema,
  discount: storeDiscountSchema,

  // Counts (from findOne)
  _count: z.object({
    items: z.number(),
    orders: z.number(),
    reviews: z.number(),
  }).optional(),
})

export type Store = z.infer<typeof storeSchema>
export type Schedule = z.infer<typeof scheduleSchema>
export const storeListSchema = z.array(storeSchema)

// ─── Create/Update form schema ───────────────────────────────────────

export const storeFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  vendorId: z.string().min(1, 'Lojista é obrigatório'),
  moduleId: z.string().min(1, 'Módulo é obrigatório'),
  zoneId: z.string().min(1, 'Zona é obrigatória'),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  latitude: z.coerce.number({ error: 'Latitude inválida' }),
  longitude: z.coerce.number({ error: 'Longitude inválida' }),
  logoUrl: z.string().optional(),
  coverUrl: z.string().optional(),
  minOrder: z.coerce.number().min(0).optional(),
  commissionRate: z.coerce.number().min(0).max(100).optional(),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  gstCode: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  offDays: z.array(z.string()).optional(),
  features: z.any().optional(),
})

export type StoreFormValues = z.infer<typeof storeFormSchema>

// ─── Stats ───────────────────────────────────────────────────────────

export const storeStatsSchema = z.object({
  total: z.number(),
  active: z.number(),
  pending: z.number(),
  featured: z.number(),
})

export type StoreStats = z.infer<typeof storeStatsSchema>
