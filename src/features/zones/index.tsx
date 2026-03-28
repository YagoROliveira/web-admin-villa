import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { useZones } from './hooks/use-zones'
import { ZonesProvider } from './components/zones-provider'
import { ZonesTable } from './components/zones-table'
import { ZonesDialogs } from './components/zones-dialogs'
import { ZonesPrimaryButtons } from './components/zones-primary-buttons'

export function Zones() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: zonesData,
    isLoading,
    isFetching,
  } = useZones(currentPage, pageSize, searchQuery)

  const zones = zonesData?.items ?? []

  return (
    <ZonesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Zonas</h2>
            <p className='text-muted-foreground'>
              Gerencie as zonas de entrega, áreas de cobertura e módulos.
            </p>
          </div>
          <ZonesPrimaryButtons />
        </div>

        <div className='my-4 flex items-center gap-4'>
          <Input
            placeholder='Buscar zonas...'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className='max-w-sm'
          />
          {isFetching && (
            <span className='text-muted-foreground text-sm'>
              Carregando...
            </span>
          )}
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <span className='text-muted-foreground'>Carregando zonas...</span>
          </div>
        ) : (
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
            <ZonesTable data={zones} />
          </div>
        )}

        {zonesData && (
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Página {zonesData.page} de {zonesData.totalPages} (
              {zonesData.total} zonas)
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
                disabled={currentPage >= (zonesData.totalPages || 1)}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </Main>

      <ZonesDialogs />
    </ZonesProvider>
  )
}
