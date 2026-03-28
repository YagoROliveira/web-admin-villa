import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useOrders, useStoreOrders, useOrderStats } from './hooks/use-orders'
import { OrdersProvider } from './components/orders-provider'
import { OrdersTable } from './components/orders-table'
import { OrdersDialogs } from './components/orders-dialogs'
import { OrdersStatsCards } from './components/orders-stats-cards'
import { ORDER_STATUS_LABELS } from './data/schema'

interface OrdersProps {
  /** When provided, filters orders by this store (vendor mode). */
  storeId?: string
}

export function Orders({ storeId }: OrdersProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const isVendor = !!storeId

  // Use the appropriate query based on role
  const adminQuery = useOrders(
    currentPage,
    pageSize,
    searchQuery,
    !isVendor
      ? { status: statusFilter !== 'ALL' ? statusFilter : undefined }
      : undefined,
    !isVendor // Only enable when NOT vendor
  )
  const vendorQuery = useStoreOrders(
    storeId ?? '',
    currentPage,
    pageSize,
    searchQuery
  )

  const ordersQuery = isVendor ? vendorQuery : adminQuery
  const { data: ordersData, isLoading, isFetching } = ordersQuery

  const { data: stats, isLoading: statsLoading } = useOrderStats(storeId)

  const orders = ordersData?.items ?? []

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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Pedidos</h2>
            <p className='text-muted-foreground'>
              {isVendor
                ? 'Gerencie os pedidos da sua loja.'
                : 'Gerencie todos os pedidos da plataforma.'}
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <OrdersStatsCards stats={stats} isLoading={statsLoading} />

        {/* Filters */}
        <div className='my-4 flex flex-wrap items-center gap-4'>
          <Input
            placeholder='Buscar pedidos...'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className='max-w-sm'
          />

          {!isVendor && (
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Filtrar por status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Todos os status</SelectItem>
                {Object.entries(ORDER_STATUS_LABELS).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {isFetching && (
            <span className='text-muted-foreground text-sm'>Carregando...</span>
          )}
        </div>

        {/* Table */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <OrdersTable data={orders} isLoading={isLoading} />
        </div>

        {/* Pagination */}
        {ordersData && (
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Página {ordersData.page} de {ordersData.totalPages} (
              {ordersData.total} pedidos)
            </span>
            <div className='flex gap-2'>
              <button
                className='rounded border px-3 py-1 text-sm disabled:opacity-50'
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Anterior
              </button>
              <button
                className='rounded border px-3 py-1 text-sm disabled:opacity-50'
                disabled={currentPage >= ordersData.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </Main>

      <OrdersDialogs />
    </OrdersProvider>
  )
}
