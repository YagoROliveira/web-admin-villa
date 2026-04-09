import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useItems, type ItemFilters } from './hooks/use-items'
import { ItemsProvider } from './components/items-provider'
import { ItemsTable } from './components/items-table'
import { ItemsDialogs } from './components/items-dialogs'
import { ItemsPrimaryButtons } from './components/items-primary-buttons'
import { useCategoryOptions, useModuleOptions } from '@/hooks/use-lookups'

export function Items() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ItemFilters>({})

  const {
    data: itemsData,
    isLoading,
    isFetching,
  } = useItems(currentPage, pageSize, searchQuery, filters)

  const { options: categoryOptions } = useCategoryOptions('')
  const { options: moduleOptions } = useModuleOptions('')

  const items = itemsData?.items ?? []

  function handleFilterChange(key: keyof ItemFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
    setCurrentPage(1)
  }

  function clearFilters() {
    setFilters({})
    setSearchQuery('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || filters.category_id || filters.store_id || filters.module_id

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

        {/* Filters */}
        <div className='my-4 flex flex-wrap items-center gap-3'>
          <Input
            placeholder='Buscar produtos...'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className='max-w-xs'
          />

          <Select
            value={filters.category_id ?? ''}
            onValueChange={(v) => handleFilterChange('category_id', v)}
          >
            <SelectTrigger className='w-44'>
              <SelectValue placeholder='Categoria' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>Todas categorias</SelectItem>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.module_id ?? ''}
            onValueChange={(v) => handleFilterChange('module_id', v)}
          >
            <SelectTrigger className='w-40'>
              <SelectValue placeholder='Módulo' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>Todos módulos</SelectItem>
              {moduleOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isFetching && (
            <span className='text-muted-foreground text-sm'>Carregando...</span>
          )}

          {hasActiveFilters && (
            <Button variant='ghost' size='sm' onClick={clearFilters}>
              Limpar filtros
            </Button>
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

        {/* Pagination */}
        {itemsData && (
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Página {itemsData.page} de {itemsData.totalPages} ({itemsData.total} produtos)
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={currentPage >= itemsData.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Main>

      <ItemsDialogs />
    </ItemsProvider>
  )
}
