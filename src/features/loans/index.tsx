import { useState } from 'react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { LoansProvider, useLoans } from './components/loans-provider'
import { LoansTable } from './components/loans-table'

function LoansContent() {
  const { loans, isLoading, error } = useLoans()
  const [activeTab, setActiveTab] = useState('today')

  // Filtrar empréstimos por status e data
  const today = new Date().toISOString().split('T')[0]

  const todayLoans = loans.filter((loan) => {
    const loanDate = loan.dataSolicitacao.split(' ')[0] // Pega apenas a data
    return loanDate === today
  })

  const approvedLoans = loans.filter((loan) =>
    loan.status === 'Aprovado' || loan.status === 'APPROVED'
  )

  const pendingLoans = loans.filter((loan) =>
    loan.status === 'Pendente' || loan.status === 'PENDING'
  )

  const rejectedLoans = loans.filter((loan) =>
    loan.status === 'Recusado' || loan.status === 'REJECTED' || loan.status === 'REFUSED'
  )

  const getFilteredLoans = () => {
    switch (activeTab) {
      case 'today':
        return todayLoans
      case 'approved':
        return approvedLoans
      case 'pending':
        return pendingLoans
      case 'rejected':
        return rejectedLoans
      default:
        return loans
    }
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Solicitações de Empréstimos
            </h2>
            <p className='text-muted-foreground'>
              Aqui estão as solicitações de empréstimos cadastradas.
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading && <div>Carregando...</div>}
          {error && <div className='text-red-500'>{error}</div>}
          {!isLoading && !error && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
              <TabsList>
                <TabsTrigger value='today' className='gap-2'>
                  Hoje
                  <Badge variant='secondary'>{todayLoans.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value='pending' className='gap-2'>
                  Pendentes
                  <Badge variant='secondary'>{pendingLoans.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value='approved' className='gap-2'>
                  Aprovadas
                  <Badge variant='secondary'>{approvedLoans.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value='rejected' className='gap-2'>
                  Recusadas
                  <Badge variant='secondary'>{rejectedLoans.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value='all' className='gap-2'>
                  Todas
                  <Badge variant='secondary'>{loans.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className='space-y-4'>
                <LoansTable data={getFilteredLoans()} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </Main>
    </>
  )
}

export function Loans() {
  return (
    <LoansProvider>
      <LoansContent />
    </LoansProvider>
  )
}
