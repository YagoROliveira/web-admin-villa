import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  Download,
  Trash2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { paymentBatchService } from '../services/payment-batch-service'
import { formatMoney } from '../utils/format'
import type { PaymentBatch, PaymentBatchStatus } from '../types/payment-batch'

interface PaymentBatchDetailsProps {
  storeId: number
  batchId: number
  onBack: () => void
}

export function PaymentBatchDetails({
  storeId,
  batchId,
  onBack,
}: PaymentBatchDetailsProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  // Buscar detalhes do lote
  const { data: batch, isLoading } = useQuery({
    queryKey: ['payment-batch', storeId, batchId],
    queryFn: () => paymentBatchService.getPaymentBatch(storeId, batchId),
  })

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: (status: PaymentBatchStatus) =>
      paymentBatchService.updateBatchStatus(storeId, batchId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batch', storeId, batchId] })
      queryClient.invalidateQueries({ queryKey: ['payment-batches', storeId] })
    },
  })

  // Mutation para upload de comprovante
  const uploadProofMutation = useMutation({
    mutationFn: (file: File) => paymentBatchService.uploadPaymentProof(storeId, batchId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batch', storeId, batchId] })
      setUploadFile(null)
    },
  })

  // Mutation para deletar comprovante
  const deleteProofMutation = useMutation({
    mutationFn: (proofId: number) =>
      paymentBatchService.deletePaymentProof(storeId, batchId, proofId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batch', storeId, batchId] })
    },
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (uploadFile) {
      uploadProofMutation.mutate(uploadFile)
    }
  }

  if (isLoading) {
    return <div className='py-8 text-center text-muted-foreground'>Carregando detalhes...</div>
  }

  if (!batch) {
    return (
      <div className='py-8 text-center text-muted-foreground'>
        <AlertCircle className='h-12 w-12 mx-auto mb-4 opacity-50' />
        <p>Lote de pagamento não encontrado</p>
        <Button variant='outline' onClick={onBack} className='mt-4'>
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={onBack}>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h3 className='text-2xl font-bold'>Lote de Pagamento #{batch.id}</h3>
            <p className='text-sm text-muted-foreground'>
              {getPeriodLabel(batch.period_type, batch.start_date, batch.end_date)}
            </p>
          </div>
        </div>
        {getStatusBadge(batch.status)}
      </div>

      {/* Info Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
              {formatMoney(batch.total_amount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{batch.items?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Criado em</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-lg font-semibold'>
              {new Date(batch.created_at).toLocaleDateString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>
              {batch.paid_at ? 'Pago em' : 'Status'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-lg font-semibold'>
              {batch.paid_at
                ? new Date(batch.paid_at).toLocaleDateString('pt-BR')
                : batch.status}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {batch.status !== 'paid' && batch.status !== 'cancelled' && (
        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-wrap gap-2'>
            {batch.status === 'draft' && (
              <Button
                onClick={() => updateStatusMutation.mutate('pending_approval')}
                disabled={updateStatusMutation.isPending}
              >
                Enviar para Aprovação
              </Button>
            )}

            {batch.status === 'pending_approval' && (
              <>
                <Button
                  onClick={() => updateStatusMutation.mutate('approved')}
                  disabled={updateStatusMutation.isPending}
                  className='gap-2'
                >
                  <CheckCircle2 className='h-4 w-4' />
                  Aprovar
                </Button>
                <Button
                  onClick={() => updateStatusMutation.mutate('draft')}
                  disabled={updateStatusMutation.isPending}
                  variant='outline'
                >
                  Rejeitar (Voltar para Rascunho)
                </Button>
              </>
            )}

            {batch.status === 'approved' && (
              <Button
                onClick={() => updateStatusMutation.mutate('processing')}
                disabled={updateStatusMutation.isPending}
              >
                Iniciar Processamento
              </Button>
            )}

            {batch.status === 'processing' && (
              <>
                <Button
                  onClick={() => updateStatusMutation.mutate('paid')}
                  disabled={updateStatusMutation.isPending}
                  className='gap-2'
                >
                  <CheckCircle2 className='h-4 w-4' />
                  Marcar como Pago
                </Button>
                <Button
                  onClick={() => updateStatusMutation.mutate('failed')}
                  disabled={updateStatusMutation.isPending}
                  variant='destructive'
                >
                  Marcar como Falhou
                </Button>
              </>
            )}

            {batch.status === 'failed' && (
              <Button
                onClick={() => updateStatusMutation.mutate('approved')}
                disabled={updateStatusMutation.isPending}
              >
                Tentar Novamente
              </Button>
            )}

            <Button
              onClick={() => updateStatusMutation.mutate('cancelled')}
              disabled={updateStatusMutation.isPending}
              variant='outline'
              className='ml-auto'
            >
              Cancelar Lote
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items do Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className='text-right'>Valor</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!batch.items || batch.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-8 text-muted-foreground'>
                    Nenhum item neste lote
                  </TableCell>
                </TableRow>
              ) : (
                batch.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant='outline'>{item.type}</Badge>
                    </TableCell>
                    <TableCell className='font-mono text-sm'>
                      {item.reference_id || '-'}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className='text-right font-semibold'>
                      {formatMoney(item.amount)}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {item.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Comprovantes */}
      <Card>
        <CardHeader>
          <CardTitle>Comprovantes de Pagamento</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Upload */}
          {batch.status === 'processing' && (
            <div className='flex gap-2 items-end'>
              <div className='flex-1'>
                <Label htmlFor='file-upload'>Fazer Upload de Comprovante</Label>
                <Input
                  id='file-upload'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  onChange={handleFileChange}
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || uploadProofMutation.isPending}
                className='gap-2'
              >
                <Upload className='h-4 w-4' />
                Upload
              </Button>
            </div>
          )}

          {/* Lista de comprovantes */}
          {batch.proofs && batch.proofs.length > 0 ? (
            <div className='space-y-2'>
              {batch.proofs.map((proof) => (
                <div
                  key={proof.id}
                  className='flex items-center justify-between p-3 border rounded-lg'
                >
                  <div className='flex items-center gap-3'>
                    <FileText className='h-5 w-5 text-muted-foreground' />
                    <div>
                      <p className='font-medium'>{proof.file_name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(proof.uploaded_at).toLocaleString('pt-BR')} •{' '}
                        {(proof.file_size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm' asChild>
                      <a href={proof.file_path} target='_blank' rel='noopener noreferrer'>
                        <Download className='h-4 w-4' />
                      </a>
                    </Button>
                    {batch.status !== 'paid' && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => deleteProofMutation.mutate(proof.id)}
                        disabled={deleteProofMutation.isPending}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-center py-8 text-muted-foreground'>
              Nenhum comprovante anexado
            </p>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      {batch.timeline && batch.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Alterações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {batch.timeline.map((event, index) => (
                <div key={event.id} className='flex gap-4'>
                  <div className='flex flex-col items-center'>
                    <div
                      className={`rounded-full p-2 ${index === 0
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-muted'
                        }`}
                    >
                      <Clock className='h-4 w-4' />
                    </div>
                    {index < batch.timeline.length - 1 && (
                      <div className='w-px h-8 bg-border' />
                    )}
                  </div>
                  <div className='flex-1 pb-4'>
                    <p className='font-medium'>{event.description}</p>
                    <div className='flex gap-4 mt-1 text-sm text-muted-foreground'>
                      <span>{new Date(event.created_at).toLocaleString('pt-BR')}</span>
                      {event.user_name && <span>• {event.user_name}</span>}
                    </div>
                    {event.old_status && event.new_status && (
                      <p className='text-sm text-muted-foreground mt-1'>
                        {event.old_status} → {event.new_status}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observações */}
      {batch.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>{batch.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
