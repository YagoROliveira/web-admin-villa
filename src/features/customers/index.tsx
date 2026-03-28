import { useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { CustomersDialogs } from './components/customers-dialogs'
import { CustomersProvider } from './components/customers-provider'
import { CustomersTable } from './components/customers-table'
import { useCustomersList } from './hooks/use-customers'

const route = getRouteApi('/_authenticated/admin/customers/')

export function Customers() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [searchQuery] = useState('')

  // Fetch all customers — client-side pagination via TanStack Table
  const {
    data: customersData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useCustomersList(1, 1000, searchQuery)

  const customers = customersData?.items ?? []
  const totalCustomers = customersData?.total ?? 0

  if (error) {
    return (
      <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4'>
        <p className='text-destructive'>
          Erro ao carregar clientes: {error.message}
        </p>
        <Button onClick={() => refetch()} variant='outline'>
          <RefreshCw className='mr-2 h-4 w-4' />
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <CustomersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Clientes do App</h2>
            <p className='text-muted-foreground'>
              Gerencie os clientes do aplicativo Villa Market.
              {totalCustomers > 0 && ` (${totalCustomers} clientes)`}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              onClick={() => refetch()}
              variant='outline'
              size='sm'
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
              />
              Atualizar
            </Button>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <CustomersTable
            data={customers}
            search={search}
            navigate={navigate}
            isLoading={isLoading}
          />
        </div>
      </Main>

      <CustomersDialogs />
    </CustomersProvider>
  )
}
