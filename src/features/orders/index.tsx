import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePhpOrders } from './hooks/use-orders'
import { OrdersProvider } from './components/orders-provider'
import { OrdersTable } from './components/orders-table'
import { OrdersDialogs } from './components/orders-dialogs'


interface OrdersProps {
  statusFilter?: string
  storeId?: string
}

export function Orders({ statusFilter = 'all' }: OrdersProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const activeStatus = statusFilter || 'all'

  const { data: ordersData, isLoading, isFetching } = usePhpOrders(
    activeStatus,
    currentPage,
    searchQuery
  )

  const orders = ordersData?.orders ?? []
  const totalOrders = ordersData?.total ?? 0
  const totalPages = ordersData?.lastPage ?? 1

  function handleSearch(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <OrdersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Pedidos</h2>
            <p className='text-muted-foreground text-sm'>
              {totalOrders > 0 ? `${totalOrders} pedidos encontrados` : 'Gerencie todos os pedidos da plataforma.'}
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className='mb-4 flex flex-wrap items-center gap-3'>
          <Input
            placeholder='Buscar por ID, status, referência...'
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className='max-w-sm'
          />
          {isFetching && (
            <span className='text-muted-foreground text-xs'>Carregando...</span>
          )}
        </div>

        {/* Table */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <OrdersTable data={orders} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Página {currentPage} de {totalPages} ({totalOrders} pedidos)
            </span>
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='sm'
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Anterior
              </Button>
              {/* Page number pills — show at most 5 pages */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size='sm'
                    className='w-8 px-0'
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className='text-muted-foreground px-1 text-sm'>...</span>
              )}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <Button
                  variant='outline'
                  size='sm'
                  className='w-8 px-0'
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              )}
              <Button
                variant='outline'
                size='sm'
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  )
}


