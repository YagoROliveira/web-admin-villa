import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { storePaymentService } from './services/store-payment-service'
import { StoresList } from './components/stores-list'
import { StoreReports } from './store-reports'

export function PayableAccounts() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined)

  // Query para listar lojas
  const { data: stores, isLoading: isLoadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storePaymentService.listStores(),
    retry: false,
  })

  const handleSelectStore = (storeId: number) => {
    setSelectedStoreId(storeId)
  }

  const handleBackToStores = () => {
    setSelectedStoreId(undefined)
  }

  // Se uma loja foi selecionada, mostrar relatórios
  if (selectedStoreId) {
    const selectedStore = stores?.find((s) => s.id === selectedStoreId)

    console.log('[PayableAccounts] selectedStoreId:', selectedStoreId, typeof selectedStoreId)
    console.log('[PayableAccounts] selectedStore:', selectedStore)

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
          <StoreReports
            storeId={selectedStoreId}
            storeName={selectedStore?.name}
            onBack={handleBackToStores}
          />
        </Main>
      </>
    )
  }

  // Tela inicial: lista de lojas
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
        <div className='mb-6'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Gestão de Pagamentos de Fornecedores
          </h2>
          <p className='text-muted-foreground'>
            Gerencie relatórios e repasses para fornecedores da Villa Market
          </p>
        </div>

        <StoresList
          stores={stores || []}
          isLoading={isLoadingStores}
          onSelectStore={handleSelectStore}
        />
      </Main>
    </>
  )
}
