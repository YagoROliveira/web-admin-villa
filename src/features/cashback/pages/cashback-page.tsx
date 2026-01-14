import { useState } from 'react'
import { useCashback } from '../components/cashback-provider'
import { CashbackStatsCards } from '../components/cashback-stats-cards'
import { CashbackTable } from '../components/cashback-table'
import { CreateCashbackDialog } from '../components/create-cashback-dialog'
import { RunWorkerDialog } from '../components/run-worker-dialog'
import { Button } from '@/components/ui/button'
import { RefreshCw, PlayCircle, RotateCcw, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { CashbackService } from '../api/cashback-service'
import { useAuthStore } from '@/stores/auth-store'

export function CashbackPage() {
  const [runWorkerOpen, setRunWorkerOpen] = useState(false)
  const {
    cashbacks,
    stats,
    isLoading,
    error,
    refreshData,
  } = useCashback()
  const { auth } = useAuthStore()
  const token = auth.accessToken

  const handleProcessPending = async () => {
    try {
      const response = await CashbackService.processPending({ limit: 100 }, token)
      if (response.success) {
        toast.success(
          `${response.data?.processedCount || 0} cashbacks processados!`
        )
        refreshData()
      } else {
        toast.error(response.error || 'Erro ao processar pendentes')
      }
    } catch (error) {
      toast.error('Erro ao processar cashbacks pendentes')
    }
  }

  const handleRetryFailed = async () => {
    try {
      const response = await CashbackService.retryFailed(
        { maxRetries: 3, limit: 50 },
        token
      )
      if (response.success) {
        toast.success(
          `${response.data?.retriedCount || 0} cashbacks reprocessados!`
        )
        refreshData()
      } else {
        toast.error(response.error || 'Erro ao reprocessar falhados')
      }
    } catch (error) {
      toast.error('Erro ao reprocessar cashbacks falhados')
    }
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Cashback</h1>
          <p className='text-muted-foreground'>
            Gerencie e acompanhe o processamento de cashback
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className='h-4 w-4' />
          </Button>
          <Button
            variant='default'
            size='sm'
            onClick={() => setRunWorkerOpen(true)}
            disabled={isLoading}
          >
            <Zap className='mr-2 h-4 w-4' />
            Rodar Worker
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleProcessPending}
            disabled={isLoading}
          >
            <PlayCircle className='mr-2 h-4 w-4' />
            Processar Pendentes
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRetryFailed}
            disabled={isLoading}
          >
            <RotateCcw className='mr-2 h-4 w-4' />
            Retry Falhados
          </Button>
          <CreateCashbackDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <CashbackStatsCards stats={stats} isLoading={isLoading} />

      {/* Backend não implementado - Mensagem informativa */}
      {!isLoading && cashbacks.length === 0 && !error && (
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950'>
          <div className='flex items-start gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
              <svg
                className='h-5 w-5 text-blue-600 dark:text-blue-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='flex-1'>
              <h3 className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                Backend de Cashback Não Implementado
              </h3>
              <p className='mt-1 text-sm text-blue-700 dark:text-blue-300'>
                O sistema de cashback ainda não foi implementado no backend. Para ativar esta funcionalidade:
              </p>
              <ul className='mt-2 list-inside list-disc space-y-1 text-sm text-blue-600 dark:text-blue-400'>
                <li>Implemente os endpoints da API conforme a documentação fornecida</li>
                <li>Execute as migrations do banco de dados (tabelas cashback e cashback_audit_log)</li>
                <li>Configure as variáveis de ambiente necessárias</li>
              </ul>
              <p className='mt-3 text-xs text-blue-600 dark:text-blue-400'>
                📄 A documentação completa está disponível no arquivo de sistema fornecido.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className='rounded-md bg-destructive/10 p-4 text-sm text-destructive'>
          {error}
        </div>
      )}

      {/* Table */}
      <div>
        <CashbackTable data={cashbacks} />
      </div>

      {/* Dialogs */}
      <RunWorkerDialog
        open={runWorkerOpen}
        onOpenChange={setRunWorkerOpen}
        onSuccess={refreshData}
      />
    </div>
  )
}
