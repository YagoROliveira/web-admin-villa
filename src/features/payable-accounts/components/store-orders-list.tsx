import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpDown } from 'lucide-react'
import type { OrderWithCosts } from '../types'
import { formatMoney, formatPaymentMethod } from '../utils/format'

interface StoreOrdersListProps {
  orders: OrderWithCosts[]
  isLoading: boolean
  onSelectOrder?: (order: OrderWithCosts) => void
}

type SortField = 'id' | 'amount' | 'date' | 'discounts' | 'tax' | 'net'
type SortDirection = 'asc' | 'desc'

export function StoreOrdersList({ orders, isLoading, onSelectOrder }: StoreOrdersListProps) {
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCosts | null>(null)

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Ordenar pedidos
  const sortedOrders = [...orders].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1

    switch (sortField) {
      case 'id': {
        const idA = a.id || a.order_id || 0
        const idB = b.id || b.order_id || 0
        return multiplier * (String(idA).localeCompare(String(idB)))
      }
      case 'amount': {
        const amtA = typeof a.order_amount === 'string' ? parseFloat(a.order_amount) : a.order_amount
        const amtB = typeof b.order_amount === 'string' ? parseFloat(b.order_amount) : b.order_amount
        return multiplier * (amtA - amtB)
      }
      case 'date':
        return multiplier * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'discounts': {
        const discA = a.total_discounts ||
          (parseFloat(a.coupon_discount_amount as any) || 0) +
          (parseFloat(a.store_discount_amount as any) || 0) +
          (parseFloat(a.flash_store_discount_amount as any) || 0)
        const discB = b.total_discounts ||
          (parseFloat(b.coupon_discount_amount as any) || 0) +
          (parseFloat(b.store_discount_amount as any) || 0) +
          (parseFloat(b.flash_store_discount_amount as any) || 0)
        return multiplier * (discA - discB)
      }
      case 'tax': {
        const taxA = parseFloat(a.total_tax_amount as any) || 0
        const taxB = parseFloat(b.total_tax_amount as any) || 0
        return multiplier * (taxA - taxB)
      }
      case 'net': {
        const amtA = typeof a.order_amount === 'string' ? parseFloat(a.order_amount) : a.order_amount
        const discA = a.total_discounts ||
          (parseFloat(a.coupon_discount_amount as any) || 0) +
          (parseFloat(a.store_discount_amount as any) || 0) +
          (parseFloat(a.flash_store_discount_amount as any) || 0)
        const taxA = parseFloat(a.total_tax_amount as any) || 0
        const netA = amtA - discA - taxA

        const amtB = typeof b.order_amount === 'string' ? parseFloat(b.order_amount) : b.order_amount
        const discB = b.total_discounts ||
          (parseFloat(b.coupon_discount_amount as any) || 0) +
          (parseFloat(b.store_discount_amount as any) || 0) +
          (parseFloat(b.flash_store_discount_amount as any) || 0)
        const taxB = parseFloat(b.total_tax_amount as any) || 0
        const netB = amtB - discB - taxB

        return multiplier * (netA - netB)
      }
      default:
        return 0
    }
  })

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

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant='ghost'
      size='sm'
      className='h-8 -ml-3'
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className='ml-2 h-4 w-4' />
    </Button>
  )

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
              {formatMoney(totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Descontos + Taxas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              - {formatMoney(totalDiscounts + totalTax)}
            </div>
          </CardContent>
        </Card>

        <Card className='border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Valor Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {formatMoney(totalNet)}
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
                  <TableHead>
                    <SortButton field='id'>Pedido</SortButton>
                  </TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>
                    <SortButton field='date'>Data</SortButton>
                  </TableHead>
                  <TableHead className='text-right'>
                    <SortButton field='amount'>Valor</SortButton>
                  </TableHead>
                  <TableHead className='text-right'>
                    <SortButton field='discounts'>Descontos</SortButton>
                  </TableHead>
                  <TableHead className='text-right'>
                    <SortButton field='tax'>Taxas</SortButton>
                  </TableHead>
                  <TableHead className='text-right'>
                    <SortButton field='net'>Líquido</SortButton>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => {
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
                    <TableRow
                      key={orderId}
                      className='cursor-pointer hover:bg-muted/50'
                      onClick={() => setSelectedOrder(order)}
                    >
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
                        {formatMoney(amount)}
                      </TableCell>
                      <TableCell className='text-right text-red-600'>
                        - {formatMoney(discounts)}
                      </TableCell>
                      <TableCell className='text-right text-orange-600'>
                        - {formatMoney(tax)}
                      </TableCell>
                      <TableCell className='text-right font-bold text-blue-600 dark:text-blue-400'>
                        {formatMoney(net)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={order.payment_status === 'paid' ? 'default' : 'secondary'}
                        >
                          {order.payment_status === 'paid' ? 'Pago' : order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm'>{formatPaymentMethod(order.payment_method)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.id || selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              Informações completas do pedido
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>Cliente</p>
                  <p className='font-medium'>ID: {selectedOrder.user_id}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Data</p>
                  <p className='font-medium'>
                    {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Status Pagamento</p>
                  <Badge variant={selectedOrder.payment_status === 'paid' ? 'default' : 'secondary'}>
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Método</p>
                  <p className='font-medium'>{formatPaymentMethod(selectedOrder.payment_method)}</p>
                </div>
              </div>

              <div className='border-t pt-4'>
                <h4 className='font-semibold mb-3'>Valores</h4>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Valor do pedido:</span>
                    <span className='font-semibold'>
                      {formatMoney(typeof selectedOrder.order_amount === 'string'
                        ? parseFloat(selectedOrder.order_amount)
                        : selectedOrder.order_amount)}
                    </span>
                  </div>
                  <div className='flex justify-between text-red-600'>
                    <span>Cupom de desconto:</span>
                    <span>- {formatMoney(parseFloat(selectedOrder.coupon_discount_amount as any) || 0)}</span>
                  </div>
                  <div className='flex justify-between text-red-600'>
                    <span>Desconto da loja:</span>
                    <span>- {formatMoney(parseFloat(selectedOrder.store_discount_amount as any) || 0)}</span>
                  </div>
                  <div className='flex justify-between text-red-600'>
                    <span>Desconto flash:</span>
                    <span>- {formatMoney(parseFloat(selectedOrder.flash_store_discount_amount as any) || 0)}</span>
                  </div>
                  <div className='flex justify-between text-orange-600'>
                    <span>Taxas:</span>
                    <span>- {formatMoney(parseFloat(selectedOrder.total_tax_amount as any) || 0)}</span>
                  </div>
                  <div className='flex justify-between border-t pt-2 text-lg font-bold text-blue-600 dark:text-blue-400'>
                    <span>Valor líquido:</span>
                    <span>
                      {(() => {
                        const amount = typeof selectedOrder.order_amount === 'string'
                          ? parseFloat(selectedOrder.order_amount)
                          : selectedOrder.order_amount
                        const discounts = (parseFloat(selectedOrder.coupon_discount_amount as any) || 0) +
                          (parseFloat(selectedOrder.store_discount_amount as any) || 0) +
                          (parseFloat(selectedOrder.flash_store_discount_amount as any) || 0)
                        const tax = parseFloat(selectedOrder.total_tax_amount as any) || 0
                        return formatMoney(amount - discounts - tax)
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão para ver detalhes completos */}
              <div className='border-t pt-4'>
                <Button
                  className='w-full'
                  onClick={() => {
                    if (onSelectOrder) {
                      onSelectOrder(selectedOrder)
                      setSelectedOrder(null)
                    }
                  }}
                >
                  Ver Detalhes Completos
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
