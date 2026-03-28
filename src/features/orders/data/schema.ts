import { z } from 'zod'

// ─── Nested summaries ────────────────────────────────────────────────

const userSummarySchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
})

const storeSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
})

const deliveryManSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
})

// ─── Order amounts ───────────────────────────────────────────────────

export const orderAmountsSchema = z.object({
  subtotal: z.number(),
  tax: z.number(),
  deliveryFee: z.number(),
  discount: z.number(),
  couponDiscount: z.number(),
  tips: z.number(),
  extraPackaging: z.number().optional(),
  total: z.number(),
})

// ─── Order Item ──────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  id: z.string(),
  itemId: z.string().nullable().optional(),
  name: z.string(),
  imageUrl: z.string().nullable().optional(),
  quantity: z.number(),
  price: z.number(),
  discount: z.number().optional(),
  tax: z.number().optional(),
  variation: z.any().nullable().optional(),
  addons: z.any().nullable().optional(),
})

// ─── Order Payment ───────────────────────────────────────────────────

export const orderPaymentSchema = z.object({
  id: z.string(),
  method: z.string(),
  amount: z.number(),
  status: z.string(),
  transactionId: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  createdAt: z.string(),
})

// ─── Order ───────────────────────────────────────────────────────────

export const orderSchema = z.object({
  id: z.string(),
  trackingId: z.string(),
  userId: z.string().nullable().optional(),
  storeId: z.string().nullable().optional(),
  deliveryManId: z.string().nullable().optional(),
  status: z.string(),
  orderType: z.string(),
  paymentMethod: z.string(),
  paymentStatus: z.string(),
  amounts: orderAmountsSchema.nullable().optional(),
  couponDiscount: z.number().optional(),
  deliveryAddress: z.any().nullable().optional(),
  deliveryCharge: z.number().optional(),
  isScheduled: z.boolean().optional(),
  scheduledAt: z.string().nullable().optional(),
  cutlery: z.boolean().optional(),
  otp: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  cancelReason: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Nested relations (populated in list/detail)
  user: userSummarySchema.nullable().optional(),
  store: storeSummarySchema.nullable().optional(),
  deliveryMan: deliveryManSummarySchema.nullable().optional(),

  // Detail only
  items: z.array(orderItemSchema).optional(),
  payments: z.array(orderPaymentSchema).optional(),
  transaction: z.any().nullable().optional(),
  refund: z.any().nullable().optional(),

  // List only
  _count: z
    .object({ items: z.number() })
    .optional(),
})

export type Order = z.infer<typeof orderSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type OrderAmounts = z.infer<typeof orderAmountsSchema>
export type OrderPayment = z.infer<typeof orderPaymentSchema>

// ─── Status helpers ──────────────────────────────────────────────────

export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'HANDOVER',
  'PICKED_UP',
  'DELIVERED',
  'CANCELED',
  'FAILED',
  'REFUND_REQUESTED',
  'REFUNDED',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  PROCESSING: { label: 'Preparando', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
  HANDOVER: { label: 'Pronto p/ Entrega', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  PICKED_UP: { label: 'A Caminho', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  CANCELED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  FAILED: { label: 'Falha', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  REFUND_REQUESTED: { label: 'Reembolso Solicitado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
}

export const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  UNPAID: { label: 'Não Pago', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'Dinheiro na Entrega',
  DIGITAL: 'PIX',
  WALLET: 'Carteira',
  PARTIAL_PAYMENT: 'Pagamento Parcial',
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  DELIVERY: 'Entrega',
  TAKEAWAY: 'Retirada',
  POS: 'POS',
}

// ─── Stats ───────────────────────────────────────────────────────────

export interface OrderStats {
  total: number
  pending: number
  confirmed: number
  processing: number
  delivered: number
  canceled: number
}
