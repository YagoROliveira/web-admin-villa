import { z } from 'zod'

// ─── Order ───────────────────────────────────────────────────────────

export const orderSchema = z.object({
  id: z.coerce.string(),
  user_id: z.coerce.string().nullable().optional(),
  store_id: z.coerce.string().nullable().optional(),
  delivery_man_id: z.coerce.string().nullable().optional(),
  zone_id: z.coerce.string().nullable().optional(),
  module_id: z.coerce.string().nullable().optional(),
  order_status: z.string(),
  order_amount: z.coerce.number(),
  coupon_discount_amount: z.coerce.number().optional(),
  coupon_discount_title: z.string().nullable().optional(),
  coupon_code: z.string().nullable().optional(),
  payment_status: z.string(),
  payment_method: z.string(),
  transaction_reference: z.string().nullable().optional(),
  order_type: z.string(),
  delivery_charge: z.coerce.number().optional(),
  original_delivery_charge: z.coerce.number().nullable().optional(),
  total_tax_amount: z.coerce.number().optional(),
  tax_status: z.string().nullable().optional(),
  additional_charge: z.coerce.number().optional(),
  ref_bonus_amount: z.coerce.number().optional(),
  order_note: z.string().nullable().optional(),
  delivery_instruction: z.string().nullable().optional(),
  unavailable_item_note: z.string().nullable().optional(),
  otp: z.string().nullable().optional(),
  checked: z.coerce.number().optional(),
  schedule_at: z.string().nullable().optional(),
  scheduled: z.coerce.number().optional(),
  delivery_address: z.any().nullable().optional(),
  delivery_address_id: z.coerce.string().nullable().optional(),
  receiver_details: z.any().nullable().optional(),
  order_attachment: z.any().nullable().optional(),
  order_proof: z.any().nullable().optional(),
  is_guest: z.coerce.number().optional(),
  prescription_order: z.coerce.number().optional(),
  cutlery: z.coerce.number().optional(),
  edited: z.coerce.number().optional(),
  partially_paid_amount: z.coerce.number().optional(),
  processing_time: z.coerce.number().nullable().optional(),
  cancellation_reason: z.string().nullable().optional(),
  cancellation_note: z.string().nullable().optional(),
  canceled_by: z.string().nullable().optional(),
  dm_vehicle_id: z.coerce.string().nullable().optional(),
  dm_last_location: z.any().nullable().optional(),
  // Status timestamps
  pending: z.string().nullable().optional(),
  accepted: z.string().nullable().optional(),
  confirmed: z.string().nullable().optional(),
  processing: z.string().nullable().optional(),
  handover: z.string().nullable().optional(),
  picked_up: z.string().nullable().optional(),
  delivered: z.string().nullable().optional(),
  canceled: z.string().nullable().optional(),
  refund_requested: z.string().nullable().optional(),
  refunded: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  // Extra financial fields from orders-with-costs
  store_discount_amount: z.coerce.number().optional(),
  flash_store_discount_amount: z.coerce.number().optional(),
  flash_admin_discount_amount: z.coerce.number().optional(),
  extra_packaging_charge: z.coerce.number().optional(),
  extra_packaging_amount: z.coerce.number().optional(),
  dm_tips: z.coerce.number().optional(),
  // Flat fields returned by orders-with-costs endpoint
  store_name: z.string().nullable().optional(),
  customer_name: z.string().nullable().optional(),
  customer_phone: z.string().nullable().optional(),
  customer_email: z.string().nullable().optional(),
  // Financial summary fields from orders-with-costs
  platform_commission_rate: z.coerce.number().optional(),
  platform_commission_amount: z.coerce.number().optional(),
  amount_after_discount: z.coerce.number().optional(),
  net_amount_to_store: z.coerce.number().optional(),
  total_discounts: z.coerce.number().optional(),
  // Nested relations (optional — only present on some endpoints)
  customer: z.object({
    id: z.coerce.string(),
    f_name: z.string().nullable().optional(),
    l_name: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
  }).nullable().optional(),
  store: z.object({
    id: z.coerce.string(),
    name: z.string(),
    phone: z.string().nullable().optional(),
    logo: z.string().nullable().optional(),
  }).nullable().optional(),
})

export type Order = z.infer<typeof orderSchema>

// ─── Order Detail (from /order/details/:id) ─────────────────────────

export interface OrderDetailAddon {
  id: number | string
  name: string
  price: number | string
  quantity?: number
}

export interface OrderDetailItem {
  id: number | string
  item_id?: number | string | null
  item_campaign_id?: number | string | null
  food_id?: number | string
  order_id?: number | string
  quantity?: number
  price?: number | string
  discount_on_item?: number | string
  discount_on_food?: number | string
  discount_type?: string
  tax_amount?: number | string
  total_add_on_price?: number | string
  variation?: string
  variant?: string
  status?: boolean | number
  // item_details / food_details holds the snapshot of the item at time of order
  item_details?: {
    id?: number | string
    name?: string
    image?: string
    price?: number | string
    unit?: string
  }
  food_details?: {
    id?: number | string
    name?: string
    image?: string
    price?: number | string
    unit?: string
  }
  add_ons?: OrderDetailAddon[]
  // Variations (grouped)
  variations?: Array<{
    name?: string
    type?: string
    values?: Array<{ label?: string; optionPrice?: string | number }>
  }>
}

export interface OrderDetailPerson {
  id?: number | string
  f_name?: string | null
  l_name?: string | null
  name?: string | null
  phone?: string | null
  email?: string | null
  image?: string | null
  order_count?: number
  delivered_order?: number
}

export interface OrderDetailStore {
  id?: number | string
  name?: string | null
  phone?: string | null
  email?: string | null
  logo?: string | null
  image?: string | null
  address?: string | null
  zone_wise_topic?: string | null
  order_count?: number
}

/** Full response from GET /order/details/:id */
export interface OrderDetailResponse {
  details?: OrderDetailItem[]
  order?: Partial<Order>
  delivery_man?: OrderDetailPerson | null
  customer?: OrderDetailPerson | null
  store?: OrderDetailStore | null
  // Some variants of this API return proof_of_delivery
  proof_img?: string | null
  // Offline payment info
  offline_payments?: {
    id?: number
    order_id?: number
    payment_info?: Record<string, unknown>
    status?: 'pending' | 'verified' | 'denied'
    note?: string
  } | null
  // Refund request
  refund?: {
    id?: number
    order_id?: number
    customer_reason?: string
    customer_note?: string
    admin_note?: string
    image?: string | Array<{ img: string; storage: string }>
    refund_amount?: number | string
    refund_method?: string
    refund_status?: 'pending' | 'approved' | 'rejected'
    order_status?: string
    created_at?: string
  } | null
}

// OrderAmounts compat type (maps to flat fields on the order)
export interface OrderAmounts {
  subtotal?: number
  tax?: number
  deliveryFee?: number
  discount?: number
  couponDiscount?: number
  tips?: number
  extraPackaging?: number
  total?: number
}

// ─── Stats (computed from totals) ────────────────────────────────────

export interface OrderStats {
  total: number
  pending: number
  confirmed: number
  processing: number
  delivered: number
  canceled: number
}

// ─── Status helpers ──────────────────────────────────────────────────

export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'processing',
  'handover',
  'item_on_the_way',
  'picked_up',
  'delivered',
  'canceled',
  'failed',
  'refunded',
  'requested',
  'rejected',
  'scheduled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  accepted: { label: 'Aceito', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  processing: { label: 'Preparando', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
  handover: { label: 'Pronto p/ Entrega', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  item_on_the_way: { label: 'A Caminho', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  picked_up: { label: 'Coletado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  failed: { label: 'Falha', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  refunded: { label: 'Reembolsado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  requested: { label: 'Reembolso Solicitado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  scheduled: { label: 'Agendado', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' },
}

export const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  unpaid: { label: 'Não Pago', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  paid: { label: 'Pago', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  refunded: { label: 'Reembolsado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash_on_delivery: 'Dinheiro na Entrega',
  digital_payment: 'PIX',
  wallet: 'Carteira',
  partial_payment: 'Pagamento Parcial',
  offline_payment: 'Pagamento Offline',
}

export const ORDER_TYPE_LABELS: Record<string, string> = {
  delivery: 'Entrega',
  take_away: 'Retirada',
  pos: 'POS',
}
