import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OrderWithCosts } from '../types'

interface StoreOrdersListProps {
  orders: OrderWithCosts[]
  isLoading: boolean
}

export function StoreOrdersList({ orders, isLoading }: StoreOrdersListProps) {
  if (isLoading) {
    return <div className='py-8 text-center text-muted-foreground'>Carregando pedidos...</div>
  }

  if (!orders || orders.length === 0) {
    return (
      <div className='py-8 text-center text-muted-foreground'>
        Nenhum pedido encontrado para o período selecionado.
      </div>
    )
  }

  // Calcular totais
  const totalAmount = orders.reduce((sum, order) => {
    const amount = typeof order.order_amount === 'string'
      ? parseFloat(order.order_amount)
      : order.order_amount
    return sum + (isNaN(amount) ? 0 : amount)
  }, 0)

  const totalDiscounts = orders.reduce((sum, order) => {
    const discount = order.total_discounts ||
      (parseFloat(order.coupon_discount_amount as any) || 0) +
      (parseFloat(order.store_discount_amount as any) || 0) +
      (parseFloat(order.flash_store_discount_amount as any) || 0)
    return sum + discount
  }, 0)

  const totalTax = orders.reduce((sum, order) => {
    const tax = parseFloat(order.total_tax_amount as any) || 0
    return sum + tax
  }, 0)

  const totalNet = totalAmount - totalDiscounts - totalTax

  return (
    <div className='space-y-4'>
      {/* Cards de Resumo */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{orders.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Total Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              R$ {totalAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Descontos + Taxas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              - R$ {(totalDiscounts + totalTax).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className='border-blue-200 bg-blue-50/50'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Valor Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              R$ {totalNet.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className='text-right'>Valor</TableHead>
                  <TableHead className='text-right'>Descontos</TableHead>
                  <TableHead className='text-right'>Taxas</TableHead>
                  <TableHead className='text-right'>Líquido</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const orderId = order.id || order.order_id
                  const amount = typeof order.order_amount === 'string'
                    ? parseFloat(order.order_amount)
                    : order.order_amount
                  const discounts = order.total_discounts ||
                    (parseFloat(order.coupon_discount_amount as any) || 0) +
                    (parseFloat(order.store_discount_amount as any) || 0) +
                    (parseFloat(order.flash_store_discount_amount as any) || 0)
                  const tax = parseFloat(order.total_tax_amount as any) || 0
                  const net = amount - discounts - tax

                  return (
                    <TableRow key={orderId}>
                      <TableCell className='font-medium'>#{orderId}</TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          <p className='font-medium'>{order.store_name || 'N/A'}</p>
                          {order.store_commission_rate && (
                            <p className='text-xs text-muted-foreground'>
                              Comissão: {order.store_commission_rate}%
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-sm'>
                        {new Date(order.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className='text-right font-medium'>
                        R$ {amount.toFixed(2)}
                      </TableCell>
                      <TableCell className='text-right text-red-600'>
                        - R$ {discounts.toFixed(2)}
                      </TableCell>
                      <TableCell className='text-right text-orange-600'>
                        - R$ {tax.toFixed(2)}
                      </TableCell>
                      <TableCell className='text-right font-bold text-blue-600'>
                        R$ {net.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                        >
                          {order.payment_status === 'paid' ? 'Pago' : order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm'>{order.payment_method || 'N/A'}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
