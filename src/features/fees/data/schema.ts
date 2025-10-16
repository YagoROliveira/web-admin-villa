import { z } from 'zod'

// Enums baseados na documentação
export const FeeTypeEnum = {
  INSTALLMENT: 'INSTALLMENT',
  PROCESSING: 'PROCESSING',
  SERVICE: 'SERVICE',
  BUS_TICKET: 'BUS_TICKET',
  BUS_INSURANCE: 'BUS_INSURANCE',
} as const

export const CalculationTypeEnum = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED',
} as const

export const AppliesToEnum = {
  GENERAL: 'GENERAL',
  USER_SPECIFIC: 'USER_SPECIFIC',
  BRAND_SPECIFIC: 'BRAND_SPECIFIC',
} as const

export const CardBrandEnum = {
  VISA: 'Visa',
  MASTER: 'Master',
  ELO: 'Elo',
  AMEX: 'Amex',
  HIPERCARD: 'Hipercard',
  DINERS: 'Diners',
} as const

export type FeeType = keyof typeof FeeTypeEnum
export type CalculationType = keyof typeof CalculationTypeEnum
export type AppliesTo = keyof typeof AppliesToEnum
export type CardBrand = keyof typeof CardBrandEnum

// Schema Zod enums
const feeTypeEnum = z.enum(['INSTALLMENT', 'PROCESSING', 'SERVICE', 'BUS_TICKET', 'BUS_INSURANCE'])
const calculationTypeEnum = z.enum(['PERCENTAGE', 'FIXED'])
const appliesToEnum = z.enum(['GENERAL', 'USER_SPECIFIC', 'BRAND_SPECIFIC'])
const cardBrandEnum = z.enum(['Visa', 'Master', 'Elo', 'Amex', 'Hipercard', 'Diners'])

// Schema principal da taxa usando nomes das colunas da tabela
export const feeSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  fee_type: feeTypeEnum,
  calculation_type: calculationTypeEnum,
  value: z.number(),
  min_installments: z.number().optional(),
  max_installments: z.number().optional(),
  applies_to: appliesToEnum,
  user_id: z.string().optional(),
  card_brand: cardBrandEnum.optional(),
  is_active: z.boolean(),
  priority: z.number().optional(),
  valid_from: z.date().optional(),
  valid_to: z.date().optional(),
  created_by: z.string().optional(),
  updated_by: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().optional(),
})

// Schema para criação de nova taxa
export const createFeeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  fee_type: feeTypeEnum,
  calculation_type: calculationTypeEnum,
  value: z.number().positive('Valor deve ser maior que zero'),
  min_installments: z.number().min(1).optional(),
  max_installments: z.number().min(1).optional(),
  applies_to: appliesToEnum,
  user_id: z.string().optional(),
  card_brand: cardBrandEnum.optional(),
  is_active: z.boolean().optional(),
  priority: z.number().optional(),
  valid_from: z.date().optional(),
  valid_to: z.date().optional(),
}).superRefine((data, ctx) => {
  // Validações de negócio
  if (data.calculation_type === 'PERCENTAGE' && data.value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Taxa percentual não pode ser maior que 100%',
      path: ['value'],
    })
  }

  if (data.min_installments && data.max_installments && data.min_installments > data.max_installments) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Parcelas mínimas não pode ser maior que as máximas',
      path: ['max_installments'],
    })
  }

  if (data.applies_to === 'USER_SPECIFIC' && !data.user_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'ID do usuário é obrigatório para taxas específicas de usuário',
      path: ['user_id'],
    })
  }

  if (data.applies_to === 'BRAND_SPECIFIC' && !data.card_brand) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Bandeira do cartão é obrigatória para taxas específicas de bandeira',
      path: ['card_brand'],
    })
  }

  if (data.valid_from && data.valid_to && data.valid_from > data.valid_to) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Data de início não pode ser posterior à data de fim',
      path: ['valid_to'],
    })
  }
})

export type Fee = z.infer<typeof feeSchema>
export type CreateFeeData = z.infer<typeof createFeeSchema>

// Schema para cálculo de taxas
export const calculateFeesSchema = z.object({
  amount: z.number().min(0.01, 'Valor deve ser maior que 0'),
  installments: z.number().min(1).max(36),
  userId: z.string().optional(),
  cardBrand: z.enum(['Visa', 'Master', 'Elo', 'Amex', 'Hipercard', 'Diners']).optional(),
  feeTypes: z.array(z.enum(['INSTALLMENT', 'PROCESSING', 'SERVICE', 'BUS_TICKET', 'BUS_INSURANCE'])).optional(),
})

export type CalculateFeesRequest = z.infer<typeof calculateFeesSchema>

export interface FeeCalculationResponse {
  success: boolean
  data: {
    totalFee: number
    feeDetails: Array<{
      id: number
      name: string
      feeType: string
      calculationType: string
      value: number
      calculatedAmount: number
    }>
  }
}

export interface FeesListResponse {
  success: boolean
  data: Fee[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Labels para exibição
export const FeeTypeLabels = {
  INSTALLMENT: 'Parcelamento',
  PROCESSING: 'Processamento',
  SERVICE: 'Serviço',
  BUS_TICKET: 'Passagem de Ônibus',
  BUS_INSURANCE: 'Seguro de Ônibus',
} as const

export const CalculationTypeLabels = {
  PERCENTAGE: 'Percentual',
  FIXED: 'Valor Fixo',
} as const

export const AppliesToLabels = {
  GENERAL: 'Geral',
  USER_SPECIFIC: 'Usuário Específico',
  BRAND_SPECIFIC: 'Bandeira Específica',
} as const

export const CardBrandLabels = {
  Visa: 'Visa',
  Master: 'Mastercard',
  Elo: 'Elo',
  Amex: 'American Express',
  Hipercard: 'Hipercard',
  Diners: 'Diners Club',
} as const