import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { useStores, useStoreStats } from './hooks/use-stores'
import { StoresProvider } from './components/stores-provider'
import { StoresTable } from './components/stores-table'
import { StoresDialogs } from './components/stores-dialogs'
import { StoresPrimaryButtons } from './components/stores-primary-buttons'
import { StoresStatsCards } from './components/stores-stats-cards'

export function Stores() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: storesData,
    isLoading,
    isFetching,
  } = useStores(currentPage, pageSize, searchQuery)

  const { data: stats, isLoading: statsLoading } = useStoreStats()

  const stores = storesData?.items ?? []

  return (
    <StoresProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Lojas</h2>
            <p className='text-muted-foreground'>
              Gerencie as lojas cadastradas na plataforma.
            </p>
          </div>
          <StoresPrimaryButtons />
        </div>

        {/* Stats cards */}
        <StoresStatsCards stats={stats} isLoading={statsLoading} />

        {/* Search */}
        <div className='my-4 flex items-center gap-4'>
          <Input
            placeholder='Buscar lojas...'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className='max-w-sm'
          />
          {isFetching && (
            <span className='text-muted-foreground text-sm'>Carregando...</span>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <span className='text-muted-foreground'>Carregando lojas...</span>
          </div>
        ) : (
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
            <StoresTable data={stores} />
          </div>
        )}

        {/* Pagination info */}
        {storesData && (
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Página {storesData.page} de {storesData.totalPages} ({storesData.total} lojas)
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
                disabled={currentPage >= storesData.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </Main>

      <StoresDialogs />
    </StoresProvider>
  )
}
