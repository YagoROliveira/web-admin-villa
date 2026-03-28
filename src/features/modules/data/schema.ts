import { z } from 'zod'

// ─── Module types available ───
export const MODULE_TYPES = [
  'food',
  'grocery',
  'pharmacy',
  'ecommerce',
  'parcel',
  'loan',
  'recharge',
  'payment',
  'ticket',
  'classifieds',
] as const

export const MODULE_TYPE_LABELS: Record<string, string> = {
  food: 'Restaurantes',
  grocery: 'Mercado',
  pharmacy: 'Farmácias',
  ecommerce: 'Shopping',
  parcel: 'Transporte',
  loan: 'Empréstimos',
  recharge: 'Recarga de Celular',
  payment: 'Pagar Contas',
  ticket: 'Passagens',
  classifieds: 'Classificados',
}

// ─── Full module from API ───
export const moduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  icon: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean(),
  allZoneService: z.boolean(),
  themeId: z.number(),
  _count: z
    .object({
      stores: z.number().optional(),
      items: z.number().optional(),
      categories: z.number().optional(),
      moduleZones: z.number().optional(),
    })
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Module = z.infer<typeof moduleSchema>

// ─── Form schema ───
export const moduleFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.string().min(1, 'Tipo é obrigatório'),
  icon: z.string().optional().default(''),
  thumbnail: z.string().optional().default(''),
  description: z.string().optional().default(''),
  isActive: z.boolean().default(true),
  allZoneService: z.boolean().default(false),
  themeId: z.coerce.number().min(1).default(1),
})

export type ModuleFormValues = z.infer<typeof moduleFormSchema>
