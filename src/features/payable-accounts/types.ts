/**
 * Tipos do Sistema de Gestão de Pagamentos de Fornecedores
 * API Base: https://prod.villamarket.app/admin/stores
 */

export type PeriodType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'annual' | 'custom'

export interface Store {
  id: number
  name: string
  email: string
  phone: string
  comission: number  // Taxa de comissão da plataforma (%)
  tax: number        // Taxa adicional
  status: number     // 1 = ativo
  created_at: string
}

export interface PaymentReport {
  store_id: number
  store_name: string
  period: string
  start_date: string  // 'YYYY-MM-DD'
  end_date: string    // 'YYYY-MM-DD'

  // Vendas
  total_orders: number
  total_sales: number  // Total bruto de vendas

  // Descontos
  total_discounts: number
  coupon_discounts: number       // Cupons aplicados
  store_discounts: number        // Descontos da loja
  flash_sale_discounts: number   // Promoções flash

  // Taxas
  total_fees: number
  platform_commission_amount: number  // Taxa da plataforma
  card_fee_amount: number            // Taxa do cartão
  platform_commission_rate: number   // % da comissão
  card_fee_rate: number              // % taxa cartão (padrão 2.5%)

  // Valor Final
  net_amount: number  // Valor líquido a repassar

  // Opcional: Lista de pedidos
  orders?: OrderWithCosts[]
}

export interface DeliveryAddress {
  contact_person_name?: string
  contact_person_number?: string
  contact_person_email?: string
  address_type?: string
  address?: string
  latitude?: string
  longitude?: string
  floor?: string
  road?: string
  house?: string
  created_at?: string
  updated_at?: string
}

export interface OrderWithCosts {
  // Dados do Pedido (formato real da API)
  id: string
  user_id: string
  order_id?: number
  order_amount: string | number
  created_at: string
  updated_at?: string
  payment_status: string
  payment_method?: string
  order_status?: string
  order_note?: string
  order_type?: string
  checked?: number
  scheduled?: number
  otp?: string

  // Dados da Loja
  store_id?: number | string
  store_name?: string
  store_commission_rate?: number

  // Dados do Cliente/Entrega (vem como string JSON da API)
  delivery_address?: string | DeliveryAddress
  delivery_address_id?: string | null
  delivery_man_id?: string | null
  customer_name?: string
  customer_phone?: string

  // Descontos
  total_discounts?: number
  coupon_discount?: number
  coupon_discount_amount?: number | string
  coupon_discount_title?: string
  coupon_code?: string
  store_discount?: number
  store_discount_amount?: number | string
  flash_sale_discount?: number
  flash_store_discount_amount?: number | string
  flash_admin_discount_amount?: number | string
  total_tax_amount?: number | string

  // Entrega
  delivery_charge?: string | number
  original_delivery_charge?: string | number
  distance?: number
  dm_tips?: number
  dm_vehicle_id?: string
  free_delivery_by?: string
  delivery_time?: string | null
  delivery_instruction?: string | null

  // Taxas
  platform_commission_amount?: number
  card_fee_amount?: number
  total_fees?: number
  tax_percentage?: number
  additional_charge?: number

  // Pagamento
  transaction_reference?: string | null
  cod_payment_type?: string | null
  cod_change_amount?: string | null
  bring_change_amount?: number
  partially_paid_amount?: number

  // Datas de Status
  pending?: string | null
  accepted?: string | null
  confirmed?: string | null
  processing?: string | null
  handover?: string | null
  picked_up?: string | null
  delivered?: string | null
  canceled?: string | null
  failed?: string | null
  refund_requested?: string | null
  refunded?: string | null

  // Cancelamento
  cancellation_reason?: string | null
  canceled_by?: string | null
  cancellation_note?: string | null

  // Outros
  zone_id?: string
  module_id?: string
  schedule_at?: string
  callback?: string | null
  adjusment?: string
  edited?: number
  order_attachment?: string | null
  order_proof?: string | null
  parcel_category_id?: string | null
  receiver_details?: string | null
  charge_payer?: string | null
  refund_request_canceled?: string | null
  prescription_order?: number
  tax_status?: string
  coupon_created_by?: string | null
  discount_on_product_by?: string
  processing_time?: string | null
  unavailable_item_note?: string | null
  cutlery?: number
  is_guest?: number
  cash_back_id?: string | null
  extra_packaging_amount?: number
  ref_bonus_amount?: number
  tax_type?: string | null

  // Valor Final
  net_amount?: number

export interface ConsolidatedReport {
  success: boolean
  period: string
  start_date: string
  end_date: string
  summary: {
    total_stores: number
    total_orders: number
    total_sales: number
    total_discounts: number
    total_fees: number
    total_net_amount: number
  }
  stores: Array<{
    store_id: number
    store_name: string
    total_orders: number
    total_sales: number
    total_discounts: number
    total_fees: number
    net_amount: number
    platform_commission_amount: number
    card_fee_amount: number
  }>
}

export interface PaymentReportFilters {
  period: PeriodType
  start_date?: string  // 'YYYY-MM-DD' - Required if period = 'custom'
  end_date?: string    // 'YYYY-MM-DD' - Required if period = 'custom'
  include_orders?: boolean
  store_id?: number
  payment_status?: string
}

export interface TransferResponse {
  success: boolean
  store_id: number
  store_name: string
  period: string
  net_amount: number
  transfer_date: string
  message: string
  next_steps: string[]
}
