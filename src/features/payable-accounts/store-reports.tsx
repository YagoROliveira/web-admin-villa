import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, List, ArrowLeft, Wallet, FileText } from 'lucide-react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { storePaymentService } from './services/store-payment-service'
import { StoreOrdersList } from './components/store-orders-list'
import { OrderDetails } from './order-details'
import { PaymentBatchesList } from './components/payment-batches-list'
import { CreatePaymentBatch } from './components/create-payment-batch'
import { PaymentBatchDetails } from './components/payment-batch-details'
import type { PaymentReportFilters, PeriodType, OrderWithCosts } from './types'
import { formatMoney } from './utils/format'

interface StoreReportsProps {
  storeId: number
  storeName?: string
  onBack?: () => void
}

export function StoreReports({ storeId, storeName, onBack }: StoreReportsProps) {
  const [period, setPeriod] = useState<PeriodType>('weekly')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [view, setView] = useState<'report' | 'orders' | 'payments'>('report')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithCosts | null>(null)
  const [paymentView, setPaymentView] = useState<'list' | 'create' | 'details'>('list')
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Garantir que storeId seja número
  const numericStoreId = typeof storeId === 'string' ? Number(storeId) : storeId

  console.log('[StoreReports] Original storeId:', storeId, 'type:', typeof storeId)
  console.log('[StoreReports] Numeric storeId:', numericStoreId, 'type:', typeof numericStoreId)

  // Construir filtros
  const filters: PaymentReportFilters = {
    period,
    ...(period === 'custom' && { start_date: startDate, end_date: endDate }),
    include_orders: false,
  }

  const ordersFilters: PaymentReportFilters = {
    store_id: numericStoreId,
    period,
    ...(period === 'custom' && { start_date: startDate, end_date: endDate }),
  }

  console.log('[StoreReports] Generating report for store:', numericStoreId, 'with filters:', filters)

  // Query para relatório da loja
  const {
    data: reportData,
    isLoading: isLoadingReport,
    error: errorReport,
    refetch: refetchReport,
  } = useQuery({
    queryKey: ['store-payment-report', numericStoreId, filters],
    queryFn: () => storePaymentService.getStorePaymentReport(numericStoreId, filters),
    enabled: view === 'report',
    retry: false,
  })

  // Query para pedidos da loja
  const {
    data: ordersData,
    isLoading: isLoadingOrders,
    error: errorOrders,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['store-orders', numericStoreId, ordersFilters],
    queryFn: () => storePaymentService.getOrdersWithCosts(ordersFilters),
    enabled: view === 'orders',
    retry: false,
  })

  const handleViewChange = (newView: string) => {
    setView(newView as 'report' | 'orders')
  }

  const handleRefresh = () => {
    if (view === 'report') {
      refetchReport()
    } else {
      refetchOrders()
    }
  }

  const handleGenerateReport = () => {
    if (view === 'report') {
      refetchReport()
    } else {
      refetchOrders()
    }
  }

  const handleGeneratePDF = async () => {
    if (!startDate || !endDate) {
      alert('Por favor, selecione as datas de início e fim')
      return
    }

    setIsGeneratingPDF(true)
    try {
      await storePaymentService.generatePaymentReportPDF(numericStoreId, {
        start_date: startDate,
        end_date: endDate,
      })
    } catch (error) {
      console.error('[StoreReports] Erro ao gerar PDF:', error)
      alert(error instanceof Error ? error.message : 'Erro ao gerar relatório PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Se um pedido foi selecionado, mostrar detalhes completos
  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            {onBack && (
              <Button variant='ghost' size='icon' onClick={onBack}>
                <ArrowLeft className='h-5 w-5' />
              </Button>
            )}
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>
                {storeName || 'Loja'}
              </h1>
              <p className='text-muted-foreground'>
                Relatórios de pagamento e repasses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs e Filtros na mesma linha */}
      <Tabs value={view} onValueChange={handleViewChange}>
        <div className='flex flex-wrap items-center gap-4 mb-6'>
          <TabsList>
            <TabsTrigger value='report' className='gap-2'>
              <LayoutDashboard size={16} />
              Relatório de Pagamento
            </TabsTrigger>
            <TabsTrigger value='orders' className='gap-2'>
              <List size={16} />
              Pedidos Detalhados
            </TabsTrigger>
            <TabsTrigger value='payments' className='gap-2'>
              <Wallet size={16} />
              Pagamentos
            </TabsTrigger>
          </TabsList>

          {/* Filtros inline */}
          <div className='flex flex-wrap items-end gap-3 flex-1'>
            {/* Filtro de Período */}
            <div className='min-w-[180px]'>
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as PeriodType)}
              >
                <SelectTrigger>
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
              <div className='min-w-[160px]'>
                <Input
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            )}

            {/* Data Fim (se período custom) */}
            {period === 'custom' && (
              <div className='min-w-[160px]'>
                <Input
                  type='date'
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}

            <div className='flex gap-2'>
              <Button onClick={handleGenerateReport}>Gerar</Button>
              {period === 'custom' && startDate && endDate && (
                <Button
                  onClick={handleGeneratePDF}
                  variant='outline'
                  disabled={isGeneratingPDF}
                  className='gap-2'
                >
                  <FileText className='h-4 w-4' />
                  {isGeneratingPDF ? 'Gerando PDF...' : 'Gerar PDF'}
                </Button>
              )}
              <Button onClick={handleRefresh} variant='outline' size='icon'>
                <LayoutDashboard className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value='report' className='mt-6'>
          {errorReport && (
            <div className='bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded mb-4'>
              <p className='font-semibold'>Erro ao carregar relatório:</p>
              <p className='text-sm'>{String(errorReport)}</p>
            </div>
          )}

          {isLoadingReport && (
            <div className='py-8 text-center text-muted-foreground'>
              Carregando relatório...
            </div>
          )}

          {!isLoadingReport && !errorReport && reportData && (
            <div className='space-y-6'>
              {/* Período */}
              <div className='bg-muted/50 p-4 rounded-lg'>
                <p className='text-sm font-medium'>
                  Período: {new Date(reportData.start_date).toLocaleDateString('pt-BR')} até{' '}
                  {new Date(reportData.end_date).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* Cards de Métricas */}
              <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium'>Total de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-green-600'>
                      {formatMoney(typeof reportData.total_sales === 'string'
                        ? parseFloat(reportData.total_sales)
                        : reportData.total_sales || 0)}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {reportData.total_orders || 0} pedidos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium'>Descontos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-red-600'>
                      - {formatMoney(typeof reportData.total_discounts === 'string'
                        ? parseFloat(reportData.total_discounts)
                        : reportData.total_discounts || 0)}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Cupons, promoções e descontos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium'>Taxas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-orange-600'>
                      - {formatMoney(typeof reportData.total_fees === 'string'
                        ? parseFloat(reportData.total_fees)
                        : reportData.total_fees || 0)}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Plataforma ({reportData.platform_commission_rate || 0}%) + Cartão (
                      {reportData.card_fee_rate || 0}%)
                    </p>
                  </CardContent>
                </Card>

                <Card className='border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm font-medium'>Valor Líquido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                      {formatMoney(typeof reportData.net_amount === 'string'
                        ? parseFloat(reportData.net_amount)
                        : reportData.net_amount || 0)}
                    </div>
                    <p className='text-xs text-muted-foreground'>Valor a repassar</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Valores</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex justify-between'>
                    <span>Cupons:</span>
                    <span className='font-semibold'>
                      {formatMoney(typeof reportData.coupon_discounts === 'string'
                        ? parseFloat(reportData.coupon_discounts)
                        : reportData.coupon_discounts || 0)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Descontos da Loja:</span>
                    <span className='font-semibold'>
                      {formatMoney(typeof reportData.store_discounts === 'string'
                        ? parseFloat(reportData.store_discounts)
                        : reportData.store_discounts || 0)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Promoções Flash:</span>
                    <span className='font-semibold'>
                      {formatMoney(typeof reportData.flash_sale_discounts === 'string'
                        ? parseFloat(reportData.flash_sale_discounts)
                        : reportData.flash_sale_discounts || 0)}
                    </span>
                  </div>
                  <div className='flex justify-between border-t pt-3'>
                    <span>Taxa da Plataforma:</span>
                    <span className='font-semibold'>
                      {formatMoney(typeof reportData.platform_commission_amount === 'string'
                        ? parseFloat(reportData.platform_commission_amount)
                        : reportData.platform_commission_amount || 0)}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Taxa do Cartão:</span>
                    <span className='font-semibold'>
                      {formatMoney(typeof reportData.card_fee_amount === 'string'
                        ? parseFloat(reportData.card_fee_amount)
                        : reportData.card_fee_amount || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!isLoadingReport && !errorReport && !reportData && (
            <div className='py-8 text-center text-muted-foreground'>
              Selecione um período e clique em "Gerar Relatório"
            </div>
          )}
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
            onSelectOrder={setSelectedOrder}
          />
        </TabsContent>

        <TabsContent value='payments' className='mt-6'>
          {paymentView === 'list' && (
            <PaymentBatchesList
              storeId={storeId}
              onCreateNew={() => setPaymentView('create')}
              onViewDetails={(batchId) => {
                setSelectedBatchId(batchId)
                setPaymentView('details')
              }}
            />
          )}

          {paymentView === 'create' && (
            <CreatePaymentBatch
              storeId={storeId}
              storeName={storeName || 'Loja'}
              onBack={() => setPaymentView('list')}
              onSuccess={(batchId) => {
                setSelectedBatchId(batchId)
                setPaymentView('list')
              }}
            />
          )}

          {paymentView === 'details' && selectedBatchId && (
            <PaymentBatchDetails
              storeId={storeId}
              batchId={selectedBatchId}
              onBack={() => setPaymentView('list')}
            />
          )}
        </TabsContent>
      </Tabs>
      ```
    </div>
  )
}
