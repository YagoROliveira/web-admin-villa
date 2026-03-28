import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { useItems } from './hooks/use-items'
import { ItemsProvider } from './components/items-provider'
import { ItemsTable } from './components/items-table'
import { ItemsDialogs } from './components/items-dialogs'
import { ItemsPrimaryButtons } from './components/items-primary-buttons'

export function Items() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: itemsData,
    isLoading,
    isFetching,
  } = useItems(currentPage, pageSize, searchQuery)

  const items = itemsData?.items ?? []

  return (
    <ItemsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Produtos</h2>
            <p className='text-muted-foreground'>
              Gerencie os produtos cadastrados na plataforma.
            </p>
          </div>
          <ItemsPrimaryButtons />
        </div>

        {/* Search */}
        <div className='my-4 flex items-center gap-4'>
          <Input
            placeholder='Buscar produtos...'
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
            <span className='text-muted-foreground'>Carregando produtos...</span>
          </div>
        ) : (
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
            <ItemsTable data={items} />
          </div>
        )}

        {/* Pagination info */}
        {itemsData && (
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Página {itemsData.page} de {itemsData.totalPages} ({itemsData.total} produtos)
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
                disabled={currentPage >= itemsData.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </Main>

      <ItemsDialogs />
    </ItemsProvider>
  )
}
