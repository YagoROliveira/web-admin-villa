import { z } from 'zod'

// ─── Related entities (nested from API) ──────────────────────────────

const categorySummarySchema = z.object({
  id: z.string(),
  name: z.string(),
})

const storeSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable().optional(),
})

const moduleSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
})

const unitSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
}).nullable().optional()

const addonSchema = z.object({
  addon: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    isActive: z.boolean().optional(),
  }),
})

const tagSchema = z.object({
  tag: z.string(),
})

// ─── Item schema ─────────────────────────────────────────────────────

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  storeId: z.string(),
  categoryId: z.string(),
  moduleId: z.string(),
  unitId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  images: z.array(z.string()).nullable().optional(),
  price: z.number(),
  discount: z.any().nullable().optional(),
  tax: z.number().nullable().optional(),
  variations: z.any().nullable().optional(),
  stock: z.number().nullable().optional(),
  minPrice: z.number().nullable().optional(),
  maxPrice: z.number().nullable().optional(),
  maxCartQty: z.number().nullable().optional(),
  isActive: z.boolean(),
  isApproved: z.boolean(),
  isVeg: z.boolean().nullable().optional(),
  isHalal: z.boolean().nullable().optional(),
  isOrganic: z.boolean().nullable().optional(),
  isRecommended: z.boolean().nullable().optional(),
  isSetMenu: z.boolean().nullable().optional(),
  availableFrom: z.string().nullable().optional(),
  availableTo: z.string().nullable().optional(),
  avgRating: z.number().nullable().optional(),
  reviewCount: z.number().nullable().optional(),
  orderCount: z.number().nullable().optional(),
  translations: z.any().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Relations
  category: categorySummarySchema.nullable().optional(),
  store: storeSummarySchema.nullable().optional(),
  module: moduleSummarySchema.nullable().optional(),
  unit: unitSummarySchema,

  // Detail-only
  addons: z.array(addonSchema).optional(),
  tags: z.array(tagSchema).optional(),
  _count: z.object({
    reviews: z.number(),
    orderItems: z.number(),
  }).optional(),
})

export type Item = z.infer<typeof itemSchema>
export const itemListSchema = z.array(itemSchema)

// ─── Create/Update form schema ───────────────────────────────────────

export const itemFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  storeId: z.string().min(1, 'Loja é obrigatória'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  moduleId: z.string().min(1, 'Módulo é obrigatório'),
  unitId: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  price: z.coerce.number({ error: 'Preço inválido' }).min(0, 'Preço deve ser ≥ 0'),
  discount: z
    .object({
      type: z.string().optional(),
      amount: z.coerce.number().min(0).optional(),
      maxDiscount: z.coerce.number().min(0).optional(),
    })
    .nullable()
    .optional(),
  tax: z.coerce.number().min(0).optional(),
  stock: z.coerce.number().int().min(0).optional(),
  maxCartQty: z.coerce.number().int().min(1).optional(),
  isVeg: z.boolean().optional(),
  isHalal: z.boolean().optional(),
  isOrganic: z.boolean().optional(),
  isRecommended: z.boolean().optional(),
  isSetMenu: z.boolean().optional(),
  availableFrom: z.string().optional(),
  availableTo: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type ItemFormValues = z.infer<typeof itemFormSchema>
