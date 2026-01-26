import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
} from 'lucide-react'
import type { DashboardMetrics } from '../types'

interface DashboardProps {
  data?: DashboardMetrics
  isLoading: boolean
}

export function PayableAccountsDashboard({ data, isLoading }: DashboardProps) {
  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <Skeleton className='h-4 w-[120px]' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-[100px]' />
                <Skeleton className='mt-2 h-4 w-[80px]' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>
          Não foi possível carregar os dados do dashboard.
        </AlertDescription>
      </Alert>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className='space-y-6'>
      {/* Status Overview Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pendentes</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.pending_count}</div>
            <p className='text-xs text-muted-foreground'>
              {formatCurrency(data.pending_total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Aprovadas</CardTitle>
            <CheckCircle2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.approved_count}</div>
            <p className='text-xs text-muted-foreground'>
              {formatCurrency(data.approved_total)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pagas</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.paid_count}</div>
            <p className='text-xs text-muted-foreground'>
              {formatCurrency(data.paid_total)}
            </p>
          </CardContent>
        </Card>

        <Card className='border-destructive'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Vencidas</CardTitle>
            <AlertCircle className='h-4 w-4 text-destructive' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-destructive'>
              {data.overdue_count}
            </div>
            <p className='text-xs text-muted-foreground'>
              {formatCurrency(data.overdue_total)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Total a Pagar</CardTitle>
            <CardDescription>Pendentes + Aprovadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(data.total_to_pay)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Vence em 7 Dias</CardTitle>
            <CardDescription>Próximos vencimentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(data.next_7_days_total || 0)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {data.next_7_days_count || 0} {(data.next_7_days_count || 0) === 1 ? 'conta' : 'contas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Vence em 30 Dias</CardTitle>
            <CardDescription>Este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(data.next_30_days_total || 0)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {data.next_30_days_count || 0} {(data.next_30_days_count || 0) === 1 ? 'conta' : 'contas'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Accounts Alert */}
      {data.overdue_count > 0 && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Atenção: Contas Vencidas</AlertTitle>
          <AlertDescription>
            Você tem {data.overdue_count} {data.overdue_count === 1 ? 'conta vencida' : 'contas vencidas'} totalizando{' '}
            {formatCurrency(data.overdue_total)}. Verifique na aba "Lista" para mais detalhes.
          </AlertDescription>
        </Alert>
      )}

      {/* Top Suppliers */}
      {data.top_suppliers && data.top_suppliers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Principais Fornecedores</CardTitle>
            <CardDescription>
              Top 5 fornecedores por valor total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {data.top_suppliers.map((supplier, index) => (
                <div
                  key={supplier.store_id}
                  className='flex items-center justify-between'
                >
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium'>
                      {index + 1}
                    </div>
                    <div>
                      <p className='font-medium'>{supplier.store_name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {supplier.total_accounts} {supplier.total_accounts === 1 ? 'conta' : 'contas'}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>
                      {formatCurrency(supplier.total_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Overdue */}
      {data.overdue_accounts && data.overdue_accounts.length > 0 && (
        <Card className='border-destructive'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5 text-destructive' />
              Contas Vencidas (Recentes)
            </CardTitle>
            <CardDescription>
              Últimas 5 contas vencidas que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {data.overdue_accounts.map((account) => (
                <div
                  key={account.id}
                  className='flex items-center justify-between rounded-lg border border-destructive/50 p-3'
                >
                  <div>
                    <p className='font-medium'>{account.store_name}</p>
                    <p className='text-xs text-muted-foreground'>
                      Vencimento: {new Date(account.due_date).toLocaleDateString('pt-BR')}
                    </p>
                    {account.description && (
                      <p className='text-xs text-muted-foreground'>
                        {account.description}
                      </p>
                    )}
                  </div>
                  <div className='text-right'>
                    <p className='font-medium text-destructive'>
                      {formatCurrency(account.net_amount)}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {Math.floor(
                        (new Date().getTime() - new Date(account.due_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )}{' '}
                      dias
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
