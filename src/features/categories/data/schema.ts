import { z } from 'zod'

// ─── Related entities ────────────────────────────────────────────────

const moduleSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
})

const childCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean().optional(),
})

const parentCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
})

// ─── Category schema ─────────────────────────────────────────────────

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  moduleId: z.string(),
  parentId: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  position: z.number(),
  priority: z.number(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  translations: z.any().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Relations
  module: moduleSummarySchema.nullable().optional(),
  parent: parentCategorySchema.nullable().optional(),
  children: z.array(childCategorySchema).optional(),
  _count: z
    .object({
      items: z.number(),
    })
    .optional(),
})

export type Category = z.infer<typeof categorySchema>
export const categoryListSchema = z.array(categorySchema)

// ─── Create/Update form schema ───────────────────────────────────────

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  moduleId: z.string().min(1, 'Módulo é obrigatório'),
  parentId: z.string().optional(),
  imageUrl: z.string().optional(),
  position: z.coerce.number().int().min(0).optional(),
  priority: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

export type CategoryFormValues = z.infer<typeof categoryFormSchema>
