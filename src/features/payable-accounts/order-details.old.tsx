import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { OrderWithCosts } from './types'

interface OrderDetailsProps {
  order: OrderWithCosts
  onBack: () => void
}

export function OrderDetails({ order, onBack }: OrderDetailsProps) {
  // Helper para formatar valores
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? value : `R$ ${parsed.toFixed(2)}`
    }
    if (typeof value === 'number') return `R$ ${value.toFixed(2)}`
    return String(value)
  }

  const formatDate = (date: any): string => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return String(date)
    }
  }

  // Calcular valores
  const orderAmount = typeof order.order_amount === 'string'
    ? parseFloat(order.order_amount)
    : order.order_amount || 0

  const couponDiscount = parseFloat(order.coupon_discount_amount as any) || 0
  const storeDiscount = parseFloat(order.store_discount_amount as any) || 0
  const flashDiscount = parseFloat(order.flash_store_discount_amount as any) || 0
  const totalDiscounts = order.total_discounts || (couponDiscount + storeDiscount + flashDiscount)
  const totalTax = parseFloat(order.total_tax_amount as any) || 0
  const netAmount = orderAmount - totalDiscounts - totalTax

  // Separar campos em categorias
  const identificationFields = {
    'ID do Pedido': order.id || order.order_id,
    'ID do Usuário': order.user_id,
    'ID da Loja': order.store_id,
    'Nome da Loja': order.store_name,
  }

  const statusFields = {
    'Status do Pagamento': order.payment_status,
    'Status do Pedido': order.order_status,
    'Método de Pagamento': order.payment_method,
  }

  const valueFields = {
    'Valor do Pedido': orderAmount,
    'Desconto Cupom': couponDiscount,
    'Desconto da Loja': storeDiscount,
    'Desconto Flash': flashDiscount,
    'Total de Descontos': totalDiscounts,
    'Taxas Totais': totalTax,
    'Comissão Plataforma': order.platform_commission_amount,
    'Taxa do Cartão': order.card_fee_amount,
    'Valor Líquido': netAmount,
  }

  const dateFields = {
    'Data de Criação': order.created_at,
  }

  const additionalFields = {
    'Taxa de Comissão da Loja': order.store_commission_rate ? `${order.store_commission_rate}%` : 'N/A',
  }

  // Todos os campos do objeto (para debug/completo)
  const allFields = Object.entries(order).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon' onClick={onBack}>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Pedido #{order.id || order.order_id}
          </h1>
          <p className='text-muted-foreground'>
            Detalhes completos do pedido
          </p>
        </div>
      </div>

      {/* Resumo Principal */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              R$ {orderAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Descontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              - R$ {totalDiscounts.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Taxas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              - R$ {totalTax.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className='border-blue-200 bg-blue-50/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Valor Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              R$ {netAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Identificação */}
      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {Object.entries(identificationFields).map(([key, value]) => (
              <div key={key}>
                <p className='text-sm text-muted-foreground'>{key}</p>
                <p className='font-medium'>{value || 'N/A'}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            {Object.entries(statusFields).map(([key, value]) => (
              <div key={key}>
                <p className='text-sm text-muted-foreground'>{key}</p>
                {key.includes('Status') ? (
                  <Badge variant={value === 'paid' || value === 'completed' ? 'default' : 'secondary'}>
                    {value || 'N/A'}
                  </Badge>
                ) : (
                  <p className='font-medium'>{value || 'N/A'}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Valores Financeiros */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento Financeiro</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {Object.entries(valueFields).map(([key, value]) => (
            <div key={key} className='flex justify-between items-center'>
              <span className='text-sm'>{key}:</span>
              <span className={`font-semibold ${key.includes('Desconto') || key.includes('Taxa') || key.includes('Comissão')
                  ? 'text-red-600'
                  : key === 'Valor Líquido'
                    ? 'text-blue-600 text-lg'
                    : ''
                }`}>
                {typeof value === 'number'
                  ? `R$ ${value.toFixed(2)}`
                  : value || 'N/A'}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Datas */}
      <Card>
        <CardHeader>
          <CardTitle>Datas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {Object.entries(dateFields).map(([key, value]) => (
              <div key={key}>
                <p className='text-sm text-muted-foreground'>{key}</p>
                <p className='font-medium'>{formatDate(value)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            {Object.entries(additionalFields).map(([key, value]) => (
              <div key={key}>
                <p className='text-sm text-muted-foreground'>{key}</p>
                <p className='font-medium'>{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dados Completos (JSON) */}
      <Card>
        <CardHeader>
          <CardTitle>Dados Completos do Objeto</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Todos os campos retornados pela API
          </p>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 max-h-[400px] overflow-y-auto'>
            {allFields.map(([key, value]) => (
              <div key={key} className='flex justify-between items-start py-2 border-b last:border-0'>
                <span className='text-sm font-mono text-muted-foreground'>{key}</span>
                <span className='font-mono text-sm max-w-md text-right break-all'>
                  {value === null || value === undefined
                    ? <span className='text-muted-foreground'>null</span>
                    : typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
