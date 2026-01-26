import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useFeesQuery } from '../hooks/use-fees-api'
import { CreateFeeDialog } from './create-fee-dialog'
import { FeesDataTable } from './fees-data-table'

export function FeesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { data: feesResponse, isLoading, error, refetch } = useFeesQuery()

  const fees = feesResponse?.data || []

  // Force refetch when component mounts
  useEffect(() => {
    refetch()
  }, [refetch])

  // Force refetch when dialog closes (taxa criada)
  useEffect(() => {
    if (!createDialogOpen) {
      // Pequeno delay para garantir que a API processou
      const timeoutId = setTimeout(() => {
        refetch()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [createDialogOpen, refetch])

  const openCreateDialog = () => setCreateDialogOpen(true)
  const closeCreateDialog = () => setCreateDialogOpen(false)

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
        <div className='space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>Gestão de Taxas</h2>
              <p className='text-muted-foreground'>
                Gerencie taxas gerais, por usuário e por bandeira de cartão
              </p>
            </div>
            <Button onClick={openCreateDialog} className='gap-2'>
              <Plus size={16} />
              Nova Taxa
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid gap-4 md:grid-cols-3'>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Total de Taxas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{fees.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Taxas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {fees.filter((fee) => fee.is_active).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Taxas Específicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {fees.filter((fee) => fee.applies_to !== 'GENERAL').length}
                </div>
                <p className='text-muted-foreground text-xs'>
                  Por usuário ou bandeira
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Taxas</CardTitle>
              <CardDescription>
                Visualize e gerencie todas as taxas configuradas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className='text-muted-foreground flex h-32 items-center justify-center'>
                  <p>Erro ao carregar taxas. Dados simulados sendo exibidos.</p>
                </div>
              ) : (
                <FeesDataTable data={fees} isLoading={isLoading} />
              )}
            </CardContent>
          </Card>

          {/* Dialogs */}
          <CreateFeeDialog
            open={createDialogOpen}
            onOpenChange={closeCreateDialog}
          />
        </div>
      </Main>
    </>
  )
}
