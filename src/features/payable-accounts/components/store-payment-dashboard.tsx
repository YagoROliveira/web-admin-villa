import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingDown, CreditCard, Package } from 'lucide-react'
import type { ConsolidatedReport } from '../types'
import { formatMoney } from '../utils/format'

interface StorePaymentDashboardProps {
  data?: ConsolidatedReport
  isLoading: boolean
}

export function StorePaymentDashboard({ data, isLoading }: StorePaymentDashboardProps) {
  if (isLoading) {
    return <div className='py-8 text-center text-muted-foreground'>Carregando dashboard...</div>
  }

  if (!data || !data.summary || !data.stores) {
    return (
      <div className='py-8 text-center text-muted-foreground'>
        Nenhum dado disponível. Selecione um período para gerar o relatório.
      </div>
    )
  }

  const { summary, stores } = data

  return (
    <div className='space-y-6'>
      {/* Período */}
      <div className='bg-muted/50 p-4 rounded-lg'>
        <p className='text-sm font-medium'>
          Período: {new Date(data.start_date).toLocaleDateString('pt-BR')} até{' '}
          {new Date(data.end_date).toLocaleDateString('pt-BR')}
        </p>
        <p className='text-xs text-muted-foreground mt-1'>
          {data.period === 'daily' && 'Relatório Diário'}
          {data.period === 'weekly' && 'Relatório Semanal'}
          {data.period === 'biweekly' && 'Relatório Quinzenal'}
          {data.period === 'monthly' && 'Relatório Mensal'}
          {data.period === 'annual' && 'Relatório Anual'}
          {data.period === 'custom' && 'Período Personalizado'}
        </p>
      </div>

      {/* Cards de Métricas */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total de Vendas</CardTitle>
            <DollarSign className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {formatMoney(summary.total_sales)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {summary.total_orders} pedidos de {summary.total_stores} lojas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total de Descontos</CardTitle>
            <TrendingDown className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              - {formatMoney(summary.total_discounts)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Cupons, promoções e descontos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total de Taxas</CardTitle>
            <CreditCard className='h-4 w-4 text-orange-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-600'>
              - {formatMoney(summary.total_fees)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Plataforma + taxas de cartão
            </p>
          </CardContent>
        </Card>

        <Card className='border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Valor Líquido Total</CardTitle>
            <Package className='h-4 w-4 text-blue-600 dark:text-blue-400' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {formatMoney(summary.total_net_amount)}
            </div>
            <p className='text-xs text-muted-foreground'>
              Valor total a repassar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Lojas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {stores.map((store) => (
              <div
                key={store.store_id}
                className='flex items-center justify-between border-b pb-4 last:border-0'
              >
                <div className='space-y-1'>
                  <p className='text-sm font-medium'>{store.store_name}</p>
                  <div className='flex gap-4 text-xs text-muted-foreground'>
                    <span>{store.total_orders} pedidos</span>
                    <span>Vendas: {formatMoney(store.total_sales)}</span>
                    <span>Descontos: {formatMoney(store.total_discounts)}</span>
                    <span>Taxas: {formatMoney(store.total_fees)}</span>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-bold text-blue-600 dark:text-blue-400'>
                    {formatMoney(store.net_amount)}
                  </p>
                  <p className='text-xs text-muted-foreground'>Valor líquido</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
