import {
  BarChart3,
  CreditCard,
  ShoppingCart,
  Store,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserStats } from '../../hooks/use-user-detail'

const orderStatusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Preparando',
  READY: 'Pronto',
  ON_THE_WAY: 'A Caminho',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const paymentMethodLabels: Record<string, string> = {
  CASH_ON_DELIVERY: 'Dinheiro na Entrega',
  WALLET: 'Carteira',
  DIGITAL_PAYMENT: 'Pagamento Digital',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
  PIX: 'PIX',
}

interface StatsTabProps {
  userId: string
}

export function StatsTab({ userId }: StatsTabProps) {
  const { data: stats, isLoading } = useUserStats(userId)

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className='h-40 w-full' />
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className='py-12'>
          <p className='text-muted-foreground text-center'>
            Não foi possível carregar as estatísticas
          </p>
        </CardContent>
      </Card>
    )
  }

  const maxPaymentCount = Math.max(...stats.paymentMethods.map((p) => p.count), 1)
  const maxStatusCount = Math.max(...stats.ordersByStatus.map((s) => s.count), 1)

  return (
    <div className='space-y-4'>
      {/* Main stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total de Pedidos'
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          description='Pedidos realizados'
        />
        <StatCard
          title='Total Gasto'
          value={`R$ ${Number(stats.totalSpent).toFixed(2)}`}
          icon={TrendingUp}
          description='Valor total em pedidos pagos'
        />
        <StatCard
          title='Ticket Médio'
          value={`R$ ${Number(stats.avgOrderValue).toFixed(2)}`}
          icon={BarChart3}
          description='Valor médio por pedido'
        />
        <StatCard
          title='Loja Favorita'
          value={stats.favoriteStore ?? 'N/A'}
          icon={Store}
          description={
            stats.favoriteStoreOrders > 0
              ? `${stats.favoriteStoreOrders} pedidos nesta loja`
              : 'Sem pedidos ainda'
          }
        />
      </div>

      {/* Last order info */}
      {stats.lastOrderAt && (
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Calendar className='h-4 w-4' />
              Último Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm'>
              <span className='text-muted-foreground'>Data: </span>
              {new Date(stats.lastOrderAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {stats.lastOrderStore && (
                <>
                  <span className='text-muted-foreground'> — Loja: </span>
                  {stats.lastOrderStore}
                </>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods & Order Status side by side  */}
      <div className='grid gap-4 md:grid-cols-2'>
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <CreditCard className='h-4 w-4' />
              Formas de Pagamento Utilizadas
            </CardTitle>
            <CardDescription>
              Distribuição por método de pagamento
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {stats.paymentMethods.length === 0 ? (
              <p className='text-muted-foreground text-sm'>Nenhum pagamento registrado</p>
            ) : (
              stats.paymentMethods.map((pm) => (
                <div key={pm.method} className='space-y-1'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>{paymentMethodLabels[pm.method] ?? pm.method}</span>
                    <Badge variant='secondary'>{pm.count}</Badge>
                  </div>
                  <Progress
                    value={(pm.count / maxPaymentCount) * 100}
                    className='h-2'
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <ShoppingCart className='h-4 w-4' />
              Pedidos por Status
            </CardTitle>
            <CardDescription>
              Distribuição por status dos pedidos
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {stats.ordersByStatus.length === 0 ? (
              <p className='text-muted-foreground text-sm'>Nenhum pedido registrado</p>
            ) : (
              stats.ordersByStatus.map((os) => (
                <div key={os.status} className='space-y-1'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>{orderStatusLabels[os.status] ?? os.status}</span>
                    <Badge variant='secondary'>{os.count}</Badge>
                  </div>
                  <Progress
                    value={(os.count / maxStatusCount) * 100}
                    className='h-2'
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: string
  icon: React.ElementType
  description: string
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='text-muted-foreground h-4 w-4' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <p className='text-muted-foreground text-xs'>{description}</p>
      </CardContent>
    </Card>
  )
}
