import { useState } from 'react'
import { ShoppingCart, Store, Package, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUserOrders } from '../../hooks/use-user-detail'

const orderStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  PROCESSING: { label: 'Preparando', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  READY: { label: 'Pronto', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
  ON_THE_WAY: { label: 'A Caminho', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
}

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  UNPAID: { label: 'Não Pago', color: 'bg-red-100 text-red-800' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-amber-100 text-amber-800' },
}

const paymentMethodLabels: Record<string, string> = {
  CASH_ON_DELIVERY: 'Dinheiro na Entrega',
  WALLET: 'Carteira',
  DIGITAL_PAYMENT: 'Pagamento Digital',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  PIX: 'PIX',
}

interface OrdersTabProps {
  userId: string
}

export function OrdersTab({ userId }: OrdersTabProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useUserOrders(userId, page)

  const orders = data?.items ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ShoppingCart className='h-5 w-5' />
          Histórico de Compras
          {data && (
            <Badge variant='secondary' className='ml-2'>
              {data.total} pedidos
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-14 w-full' />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p className='text-muted-foreground py-8 text-center'>
            Nenhum pedido encontrado
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const statusInfo = orderStatusLabels[order.status] ?? {
                    label: order.status,
                    color: 'bg-gray-100 text-gray-800',
                  }
                  const paymentInfo = paymentStatusLabels[order.paymentStatus] ?? {
                    label: order.paymentStatus,
                    color: 'bg-gray-100 text-gray-800',
                  }
                  const total = order.amounts?.total ?? 0

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className='space-y-1'>
                          <p className='font-mono text-xs'>
                            #{order.trackingId.slice(0, 8)}
                          </p>
                          <Badge variant='outline' className='text-xs'>
                            {order.orderType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Store className='text-muted-foreground h-4 w-4' />
                          <span className='text-sm'>
                            {order.store?.name ?? '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <Package className='text-muted-foreground h-4 w-4' />
                          <span className='text-sm'>{order.items.length} itens</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.color} variant='outline'>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentInfo.color} variant='outline'>
                          {paymentInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm'>
                        {paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod}
                      </TableCell>
                      <TableCell className='font-medium'>
                        R$ {Number(total).toFixed(2)}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-xs'>
                        {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className='mt-4 flex items-center justify-between'>
                <p className='text-muted-foreground text-sm'>
                  Página {data.page} de {data.totalPages} ({data.total} pedidos)
                </p>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={page >= data.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
