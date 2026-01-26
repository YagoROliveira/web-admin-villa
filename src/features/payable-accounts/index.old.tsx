import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, LayoutDashboard, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearch, useNavigate } from '@tanstack/react-router'
import {
  PayableAccountsDashboard,
  PayableAccountsList,
  CreateAccountDialog,
} from './components'
import { payableAccountService } from './services/api'
import type { PayableAccountFilters } from './types'

export function PayableAccounts() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as any
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const view = search.view || 'list'

  // Construir filtros da busca
  const filters: PayableAccountFilters = {
    status: search.status?.length ? search.status : undefined,
    store_id: search.store_id,
    due_date_start: search.due_date_start || undefined,
    due_date_end: search.due_date_end || undefined,
    search: search.search || undefined,
    limit: search.pageSize,
    offset: search.page ? (search.page - 1) * (search.pageSize || 10) : 0,
  }

  // Query para lista de contas
  const {
    data: accountsData,
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts,
  } = useQuery({
    queryKey: ['payable-accounts', filters],
    queryFn: () => payableAccountService.listAccounts(filters),
    enabled: view === 'list',
    retry: false,
  })

  // Query para dashboard
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ['payable-accounts-dashboard'],
    queryFn: () => payableAccountService.getDashboard(),
    enabled: view === 'dashboard',
    retry: false,
  })

  const handleViewChange = (newView: string) => {
    navigate({
      to: '/payable-accounts',
      search: {
        ...search,
        view: newView as 'list' | 'dashboard',
      },
    })
  }

  const handleRefresh = () => {
    if (view === 'dashboard') {
      refetchDashboard()
    } else {
      refetchAccounts()
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Contas a Pagar</h1>
          <p className='text-muted-foreground'>
            Gerencie contas a pagar dos fornecedores da Villa Market
          </p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={handleRefresh} variant='outline'>
            Atualizar
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)} className='gap-2'>
            <Plus size={16} />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Tabs para Dashboard / Lista */}
      <Tabs value={view} onValueChange={handleViewChange}>
        <TabsList>
          <TabsTrigger value='dashboard' className='gap-2'>
            <LayoutDashboard size={16} />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value='list' className='gap-2'>
            <List size={16} />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='mt-6'>
          <PayableAccountsDashboard
            data={dashboardData}
            isLoading={isLoadingDashboard}
          />
        </TabsContent>

        <TabsContent value='list' className='mt-6'>
          <PayableAccountsList
            accounts={accountsData?.accounts || []}
            total={accountsData?.total || 0}
            summary={accountsData?.summary}
            isLoading={isLoadingAccounts}
            onRefresh={refetchAccounts}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog de criação */}
      <CreateAccountDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  )
}
