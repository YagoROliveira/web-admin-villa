import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, List, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { storePaymentService } from './services/store-payment-service'
import { StorePaymentDashboard } from './components/store-payment-dashboard'
import { StoreOrdersList } from './components/store-orders-list'
import type { PaymentReportFilters, PeriodType } from './types'

export function PayableAccounts() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as any

  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined)
  const [period, setPeriod] = useState<PeriodType>('weekly')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [view, setView] = useState<'dashboard' | 'orders'>('dashboard')

  // Query para listar lojas
  const { data: stores, isLoading: isLoadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storePaymentService.listStores(),
    retry: false,
  })

  // Construir filtros
  const filters: PaymentReportFilters = {
    period,
    ...(period === 'custom' && { start_date: startDate, end_date: endDate }),
    ...(selectedStoreId && view === 'orders' && { store_id: selectedStoreId }),
  }

  // Query para relatório consolidado (dashboard)
  const {
    data: consolidatedData,
    isLoading: isLoadingDashboard,
    error: errorDashboard,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ['consolidated-report', filters],
    queryFn: () => storePaymentService.getAllStoresPaymentReport(filters),
    enabled: view === 'dashboard' && period !== undefined,
    retry: false,
  })

  // Query para pedidos (lista)
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: errorOrders,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['orders-with-costs', filters],
    queryFn: () => storePaymentService.getOrdersWithCosts(filters),
    enabled: view === 'orders',
    retry: false,
  })

  const handleViewChange = (newView: string) => {
    setView(newView as 'dashboard' | 'orders')
  }

  const handleRefresh = () => {
    if (view === 'dashboard') {
      refetchDashboard()
    } else {
      refetchOrders()
    }
  }

  const handleGenerateReport = () => {
    if (view === 'dashboard') {
      refetchDashboard()
    } else {
      refetchOrders()
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Gestão de Pagamentos de Fornecedores
          </h1>
          <p className='text-muted-foreground'>
            Gerencie relatórios e repasses para fornecedores da Villa Market
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className='bg-card border rounded-lg p-6 space-y-4'>
        <h3 className='font-semibold'>Filtros</h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Filtro de Loja (apenas para visualização de pedidos) */}
          {view === 'orders' && (
            <div className='space-y-2'>
              <Label htmlFor='store'>Loja (Opcional)</Label>
              <Select
                value={selectedStoreId?.toString() || 'all'}
                onValueChange={(value) =>
                  setSelectedStoreId(value === 'all' ? undefined : Number(value))
                }
              >
                <SelectTrigger id='store'>
                  <SelectValue placeholder='Todas as lojas' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todas as lojas</SelectItem>
                  {stores?.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filtro de Período */}
          <div className='space-y-2'>
            <Label htmlFor='period'>Período</Label>
            <Select
              value={period}
              onValueChange={(value) => setPeriod(value as PeriodType)}
            >
              <SelectTrigger id='period'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='daily'>Diário</SelectItem>
                <SelectItem value='weekly'>Semanal</SelectItem>
                <SelectItem value='biweekly'>Quinzenal</SelectItem>
                <SelectItem value='monthly'>Mensal</SelectItem>
                <SelectItem value='annual'>Anual</SelectItem>
                <SelectItem value='custom'>Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Início (se período custom) */}
          {period === 'custom' && (
            <div className='space-y-2'>
              <Label htmlFor='start-date'>Data Início</Label>
              <Input
                id='start-date'
                type='date'
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          )}

          {/* Data Fim (se período custom) */}
          {period === 'custom' && (
            <div className='space-y-2'>
              <Label htmlFor='end-date'>Data Fim</Label>
              <Input
                id='end-date'
                type='date'
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className='flex gap-2'>
          <Button onClick={handleGenerateReport}>Gerar Relatório</Button>
          <Button onClick={handleRefresh} variant='outline'>
            Atualizar
          </Button>
        </div>
      </div>

      {/* Tabs para Dashboard / Pedidos */}
      <Tabs value={view} onValueChange={handleViewChange}>
        <TabsList>
          <TabsTrigger value='dashboard' className='gap-2'>
            <LayoutDashboard size={16} />
            Dashboard Consolidado
          </TabsTrigger>
          <TabsTrigger value='orders' className='gap-2'>
            <List size={16} />
            Pedidos Detalhados
          </TabsTrigger>
        </TabsList>

        <TabsContent value='dashboard' className='mt-6'>
          {errorDashboard && (
            <div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4'>
              <p className='font-semibold'>Erro ao carregar dashboard:</p>
              <p className='text-sm'>{String(errorDashboard)}</p>
            </div>
          )}
          <StorePaymentDashboard
            data={consolidatedData}
            isLoading={isLoadingDashboard}
          />
        </TabsContent>

        <TabsContent value='orders' className='mt-6'>
          {errorOrders && (
            <div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4'>
              <p className='font-semibold'>Erro ao carregar pedidos:</p>
              <p className='text-sm'>{String(errorOrders)}</p>
            </div>
          )}
          <StoreOrdersList
            orders={ordersData?.orders || []}
            isLoading={isLoadingOrders}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
