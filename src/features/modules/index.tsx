import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Input } from '@/components/ui/input'
import { useModules } from './hooks/use-modules'
import { ModulesProvider } from './components/modules-provider'
import { ModulesTable } from './components/modules-table'
import { ModulesDialogs } from './components/modules-dialogs'
import { ModulesPrimaryButtons } from './components/modules-primary-buttons'

export function Modules() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')

  const {
    data: modulesData,
    isLoading,
    isFetching,
  } = useModules(currentPage, pageSize, searchQuery)

  const modules = modulesData?.items ?? []

  return (
    <ModulesProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Módulos</h2>
            <p className='text-muted-foreground'>
              Gerencie os módulos da plataforma (Alimentação, Mercado, Farmácia, etc).
            </p>
          </div>
          <ModulesPrimaryButtons />
        </div>

        <div className='my-4 flex items-center gap-4'>
          <Input
            placeholder='Buscar módulos...'
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

        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <span className='text-muted-foreground'>Carregando módulos...</span>
          </div>
        ) : (
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
            <ModulesTable data={modules} />
          </div>
        )}

        {modulesData && (
          <div className='mt-4 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Página {modulesData.page} de {modulesData.totalPages} ({modulesData.total} módulos)
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
                disabled={currentPage >= modulesData.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </Main>

      <ModulesDialogs />
    </ModulesProvider>
  )
}
