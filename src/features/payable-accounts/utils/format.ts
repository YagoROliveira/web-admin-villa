/**
 * Formata um valor para moeda brasileira (Real - BRL)
 * @param value - O valor a ser formatado (pode ser string, número ou null/undefined)
 * @returns String formatada no padrão brasileiro (ex: R$ 1.234,56)
 */
export const formatMoney = (value: any): string => {
  if (value === null || value === undefined) return 'R$ 0,00'

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return 'R$ 0,00'

  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Formata um valor numérico com separadores brasileiros (sem símbolo de moeda)
 * @param value - O valor a ser formatado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns String formatada no padrão brasileiro (ex: 1.234,56)
 */
export const formatNumber = (value: any, decimals: number = 2): string => {
  if (value === null || value === undefined) return '0,00'

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return '0,00'

  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Mapa de métodos de pagamento
 */
const PAYMENT_METHOD_MAP: Record<string, string> = {
  external: 'Pago no App',
  digital_payment: 'Pago no App',
  wallet: 'Saldo da Carteira',
  cash_on_delivery: 'Pagamento na Entrega',
}

/**
 * Formata o método de pagamento para exibição amigável
 * @param method - O método de pagamento (external, wallet, cash_on_delivery, etc.)
 * @returns String formatada do método de pagamento
 */
export const formatPaymentMethod = (method: string | null | undefined): string => {
  if (!method) return 'N/A'
  return PAYMENT_METHOD_MAP[method] || method
}
