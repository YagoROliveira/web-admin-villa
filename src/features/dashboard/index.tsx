import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { useDashboardStats } from './hooks/use-dashboard-stats'
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  FileText,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

export function Dashboard() {
  const { cashback, loans, orders, isLoading } = useDashboardStats()
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ms-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-6 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>
        <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {/* Cashback Total */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Cashback Total
                  </CardTitle>
                  <DollarSign className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-32' />
                  ) : (
                    <>
                      <div className='text-2xl font-bold'>
                        {cashback.data?.totalCashback
                          ? Number(cashback.data.totalCashback).toLocaleString(
                              'pt-BR',
                              {
                                style: 'currency',
                                currency: 'BRL',
                              }
                            )
                          : 'R$ 0,00'}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        {cashback.data?.totalProcessed || 0} processados
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Total de Pedidos Processados */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Pedidos Processados
                  </CardTitle>
                  <CreditCard className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-32' />
                  ) : (
                    <>
                      <div className='text-2xl font-bold'>
                        {orders.data?.processed?.toLocaleString('pt-BR') || 0}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        de {orders.data?.total?.toLocaleString('pt-BR') || 0}{' '}
                        pedidos
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Total de Empréstimos Solicitados */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Empréstimos Solicitados
                  </CardTitle>
                  <FileText className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-32' />
                  ) : (
                    <>
                      <div className='text-2xl font-bold'>
                        {loans.data?.totalRequested || 0}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        Total de solicitações
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Total de Empréstimos Aprovados */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Empréstimos Aprovados
                  </CardTitle>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-32' />
                  ) : (
                    <>
                      <div className='text-2xl font-bold text-green-600'>
                        {loans.data?.totalApproved || 0}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        {loans.data?.totalRequested
                          ? (
                              ((loans.data.totalApproved || 0) /
                                loans.data.totalRequested) *
                              100
                            ).toFixed(1)
                          : 0}
                        % de aprovação
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Total a Receber */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total a Receber
                  </CardTitle>
                  <TrendingUp className='text-muted-foreground h-4 w-4' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-32' />
                  ) : (
                    <>
                      <div className='text-2xl font-bold'>
                        {loans.data?.totalToReceive
                          ? Number(loans.data.totalToReceive).toLocaleString(
                              'pt-BR',
                              {
                                style: 'currency',
                                currency: 'BRL',
                              }
                            )
                          : 'R$ 0,00'}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        De empréstimos aprovados
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Parcelas Atrasadas */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Parcelas Atrasadas
                  </CardTitle>
                  <AlertCircle className='h-4 w-4 text-red-600' />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className='h-8 w-32' />
                  ) : (
                    <>
                      <div className='text-2xl font-bold text-red-600'>
                        {loans.data?.overdueInstallments || 0}
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        Requerem atenção
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Cashback por Mês</CardTitle>
                  <CardDescription>
                    Distribuição de cashback nos últimos meses
                  </CardDescription>
                </CardHeader>
                <CardContent className='ps-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Cashbacks Recentes</CardTitle>
                  <CardDescription>
                    Últimos cashbacks processados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales />
                </CardContent>
              </Card>
            </div>
        </div>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
    disabled: false,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
    disabled: true,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
    disabled: true,
  },
]
