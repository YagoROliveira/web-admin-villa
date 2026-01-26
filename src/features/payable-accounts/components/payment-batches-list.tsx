import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Calendar, DollarSign, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { paymentBatchService } from '../services/payment-batch-service'
import { formatMoney } from '../utils/format'
import type { PaymentBatchSummary, PaymentBatchStatus } from '../types/payment-batch'

interface PaymentBatchesListProps {
  storeId: number
  onCreateNew: () => void
  onViewDetails: (batchId: number) => void
}

export function PaymentBatchesList({
  storeId,
  onCreateNew,
  onViewDetails,
}: PaymentBatchesListProps) {
  const { data: batches, isLoading } = useQuery({
    queryKey: ['payment-batches', storeId],
    queryFn: () => paymentBatchService.listPaymentBatches(storeId),
    retry: false,
  })

  const getStatusBadge = (status: PaymentBatchStatus) => {
    const variants = {
      draft: { variant: 'secondary' as const, label: 'Rascunho', icon: FileText },
      pending_approval: { variant: 'outline' as const, label: 'Aguardando Aprovação', icon: Clock },
      approved: { variant: 'default' as const, label: 'Aprovado', icon: CheckCircle2 },
      processing: { variant: 'default' as const, label: 'Processando', icon: Clock },
      paid: { variant: 'default' as const, label: 'Pago', icon: CheckCircle2 },
      failed: { variant: 'destructive' as const, label: 'Falhou', icon: XCircle },
      cancelled: { variant: 'secondary' as const, label: 'Cancelado', icon: XCircle },
    }

    const config = variants[status] || variants.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className='gap-1'>
        <Icon className='h-3 w-3' />
        {config.label}
      </Badge>
    )
  }

  const getPeriodLabel = (type: string, startDate: string, endDate: string) => {
    const labels: Record<string, string> = {
      daily: 'Diário',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      annual: 'Anual',
      custom: 'Personalizado',
    }

    const label = labels[type] || type
    const start = new Date(startDate).toLocaleDateString('pt-BR')
    const end = new Date(endDate).toLocaleDateString('pt-BR')

    return `${label} (${start} - ${end})`
  }

  if (isLoading) {
    return <div className='py-8 text-center text-muted-foreground'>Carregando pagamentos...</div>
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold'>Histórico de Pagamentos</h3>
          <p className='text-sm text-muted-foreground'>
            Loja ID: {storeId}
          </p>
        </div>
        <Button onClick={onCreateNew} className='gap-2'>
          <Plus className='h-4 w-4' />
          Novo Pagamento
        </Button>
      </div>

      {/* Stats */}
      {batches && batches.length > 0 && (
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total de Lotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{batches.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
                {batches.filter((b) => b.status === 'paid').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-orange-600 dark:text-orange-400'>
                {batches.filter((b) => ['pending_approval', 'approved', 'processing'].includes(b.status)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium'>Total Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                {formatMoney(
                  batches
                    .filter((b) => b.status === 'paid')
                    .reduce((sum, b) => sum + b.total_amount, 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Valor</TableHead>
                <TableHead className='text-right'>Items</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead>Data Pagamento</TableHead>
                <TableHead className='text-right'>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!batches || batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-center py-8 text-muted-foreground'>
                    <div className='flex flex-col items-center gap-2'>
                      <AlertCircle className='h-8 w-8 opacity-50' />
                      <p>Nenhum pagamento registrado ainda</p>
                      <Button onClick={onCreateNew} variant='outline' size='sm' className='mt-2'>
                        Criar Primeiro Pagamento
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow
                    key={batch.id}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => onViewDetails(batch.id)}
                  >
                    <TableCell className='font-medium'>#{batch.id}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>
                          {getPeriodLabel(batch.period_type, batch.start_date, batch.end_date)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(batch.status)}</TableCell>
                    <TableCell className='text-right font-semibold'>
                      {formatMoney(batch.total_amount)}
                    </TableCell>
                    <TableCell className='text-right'>{batch.items_count}</TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {new Date(batch.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {batch.paid_at
                        ? new Date(batch.paid_at).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewDetails(batch.id)
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
