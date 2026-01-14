import { useEffect, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Send,
  RotateCcw,
  ExternalLink,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  ShoppingCart,
  Calendar,
  DollarSign,
  Hash,
  Tag,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { CashbackService } from '../api/cashback-service'
import { CashbackStatusBadge, CashbackTypeBadge } from '../components/cashback-badges'
import { useAuthStore } from '@/stores/auth-store'
import type { Cashback, CashbackAuditLog } from '../types'

export function CashbackDetailsPage() {
  const params = useParams({ from: '/_authenticated/cashback/$orderId' })
  const navigate = useNavigate()
  const { auth } = useAuthStore()
  const token = auth.accessToken

  const [cashback, setCashback] = useState<Cashback | null>(null)
  const [auditLogs, setAuditLogs] = useState<CashbackAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orderId = params.orderId

  useEffect(() => {
    loadCashbackDetails()
  }, [orderId])

  const loadCashbackDetails = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Busca detalhes do cashback por orderId
      const response = await CashbackService.getByOrderId(orderId, token)

      if (response.success && response.data) {
        setCashback(response.data)

        // Busca logs de auditoria usando o ID do cashback retornado
        const logsResponse = await CashbackService.getAuditLogs(response.data.id, token)
        if (logsResponse.success && logsResponse.data) {
          setAuditLogs(logsResponse.data)
        }
      } else {
        setError(response.error || 'Erro ao carregar cashback')
      }
    } catch (err) {
      setError('Erro ao carregar detalhes do cashback')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessCashback = async () => {
    if (!cashback) return

    try {
      const response = await CashbackService.processById(cashback.id, token)

      if (response.success) {
        toast.success('Cashback processado com sucesso!')
        loadCashbackDetails()
      } else {
        toast.error(response.error || 'Erro ao processar cashback')
      }
    } catch (error) {
      toast.error('Erro ao processar cashback')
    }
  }

  const handleResendNotification = async () => {
    if (!cashback) return

    try {
      const response = await CashbackService.resendNotification(
        cashback.id,
        token
      )

      if (response.success) {
        toast.success('Notificação reenviada com sucesso!')
        loadCashbackDetails()
      } else {
        toast.error(response.error || 'Erro ao reenviar notificação')
      }
    } catch (error) {
      toast.error('Erro ao reenviar notificação')
    }
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-10 w-10' />
          <div className='space-y-2'>
            <Skeleton className='h-8 w-[300px]' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
        </div>
        <div className='grid gap-6 md:grid-cols-2'>
          <Skeleton className='h-[400px]' />
          <Skeleton className='h-[400px]' />
        </div>
      </div>
    )
  }

  if (error || !cashback) {
    return (
      <div className='space-y-6'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate({ to: '/cashback' })}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
        <Card className='border-destructive'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2 text-destructive'>
              <AlertCircle className='h-5 w-5' />
              <p>{error || 'Cashback não encontrado'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/cashback' })}
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar
          </Button>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Cashback #{cashback.id}
            </h1>
            <p className='text-sm text-muted-foreground'>
              Pedido {cashback.orderId}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {cashback.status === 'PENDING' && (
            <Button size='sm' onClick={handleProcessCashback}>
              <RotateCcw className='mr-2 h-4 w-4' />
              Processar
            </Button>
          )}
          {cashback.status === 'COMPLETED' && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleResendNotification}
            >
              <Send className='mr-2 h-4 w-4' />
              Reenviar Notificação
            </Button>
          )}
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Informações Principais */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5' />
              Informações do Cashback
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-muted-foreground'>Status</p>
                <CashbackStatusBadge status={cashback.status} />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Tipo</p>
                <CashbackTypeBadge type={cashback.cashbackType} />
              </div>
            </div>

            <Separator />

            <div className='space-y-3'>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>
                    Valor do Pedido
                  </p>
                  <p className='text-2xl font-bold'>
                    {cashback.orderAmountReais?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
              </div>

              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm text-muted-foreground'>
                    Valor do Cashback
                  </p>
                  <p className='text-2xl font-bold text-green-600'>
                    {cashback.cashbackAmountReais?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                {cashback.cashbackPercentage && (
                  <Badge variant='secondary' className='mt-1'>
                    {cashback.cashbackPercentage}%
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-sm'>
                <ShoppingCart className='h-4 w-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Pedido:</span>
                <span className='font-mono'>{cashback.orderId}</span>
              </div>
              <div className='flex items-center gap-2 text-sm'>
                <User className='h-4 w-4 text-muted-foreground' />
                <span className='text-muted-foreground'>Usuário:</span>
                <div className='flex flex-col'>
                  {cashback.userName && (
                    <span className='font-medium'>{cashback.userName}</span>
                  )}
                  <span className='font-mono text-xs text-muted-foreground'>
                    ID: {cashback.userId}
                  </span>
                </div>
              </div>
              {cashback.campaignId && (
                <div className='flex items-center gap-2 text-sm'>
                  <Tag className='h-4 w-4 text-muted-foreground' />
                  <span className='text-muted-foreground'>Campanha:</span>
                  <span className='font-mono'>{cashback.campaignId}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalhes Técnicos */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Hash className='h-5 w-5' />
              Detalhes Técnicos
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div className='flex-1'>
                  <p className='text-sm text-muted-foreground'>Criado em</p>
                  <p className='text-sm font-medium'>
                    {format(
                      new Date(cashback.createdAt),
                      "dd/MM/yyyy 'às' HH:mm",
                      { locale: ptBR }
                    )}
                  </p>
                </div>
              </div>

              {cashback.processedAt && (
                <div className='flex items-center gap-2'>
                  <CheckCircle2 className='h-4 w-4 text-green-600' />
                  <div className='flex-1'>
                    <p className='text-sm text-muted-foreground'>
                      Processado em
                    </p>
                    <p className='text-sm font-medium'>
                      {format(
                        new Date(cashback.processedAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                </div>
              )}

              {cashback.notificationSentAt && (
                <div className='flex items-center gap-2'>
                  <Send className='h-4 w-4 text-blue-600' />
                  <div className='flex-1'>
                    <p className='text-sm text-muted-foreground'>
                      Notificação enviada
                    </p>
                    <p className='text-sm font-medium'>
                      {format(
                        new Date(cashback.notificationSentAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                </div>
              )}

              {cashback.failedAt && (
                <div className='flex items-center gap-2'>
                  <AlertCircle className='h-4 w-4 text-destructive' />
                  <div className='flex-1'>
                    <p className='text-sm text-muted-foreground'>Falhou em</p>
                    <p className='text-sm font-medium'>
                      {format(
                        new Date(cashback.failedAt),
                        "dd/MM/yyyy 'às' HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className='space-y-2 text-sm'>
              {cashback.walletTransactionId && (
                <div>
                  <p className='text-muted-foreground'>ID da Transação</p>
                  <p className='font-mono text-xs break-all'>
                    {cashback.walletTransactionId}
                  </p>
                </div>
              )}
              {cashback.idempotencyKey && (
                <div>
                  <p className='text-muted-foreground'>Chave de Idempotência</p>
                  <p className='font-mono text-xs break-all'>
                    {cashback.idempotencyKey}
                  </p>
                </div>
              )}
              <div>
                <p className='text-muted-foreground'>Tentativas de Retry</p>
                <p className='font-medium'>{cashback.retryCount}</p>
              </div>
              <div>
                <p className='text-muted-foreground'>Notificação Enviada</p>
                <p className='font-medium'>
                  {cashback.notificationSent ? 'Sim' : 'Não'}
                </p>
              </div>
            </div>

            {cashback.failureReason && (
              <>
                <Separator />
                <div className='rounded-md bg-destructive/10 p-3'>
                  <p className='text-sm font-medium text-destructive'>
                    Motivo da Falha
                  </p>
                  <p className='mt-1 text-sm text-destructive/80'>
                    {cashback.failureReason}
                  </p>
                </div>
              </>
            )}

            {cashback.reversalReason && (
              <>
                <Separator />
                <div className='rounded-md bg-orange-500/10 p-3'>
                  <p className='text-sm font-medium text-orange-600'>
                    Motivo da Reversão
                  </p>
                  <p className='mt-1 text-sm text-orange-600/80'>
                    {cashback.reversalReason}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        {cashback.metadata && Object.keys(cashback.metadata).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Metadados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {Object.entries(cashback.metadata).map(([key, value]) => (
                  <div key={key} className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>{key}:</span>
                    <span className='font-mono'>
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logs de Auditoria */}
        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Histórico de Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLogs.length > 0 ? (
              <div className='space-y-3'>
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className='flex items-start gap-3 rounded-md border p-3'
                  >
                    <Clock className='h-4 w-4 text-muted-foreground mt-0.5' />
                    <div className='flex-1 space-y-1'>
                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium'>{log.action}</p>
                        <p className='text-xs text-muted-foreground'>
                          {format(
                            new Date(log.createdAt),
                            "dd/MM/yyyy HH:mm:ss",
                            { locale: ptBR }
                          )}
                        </p>
                      </div>
                      {log.previousStatus && log.newStatus && (
                        <p className='text-sm text-muted-foreground'>
                          Status: {log.previousStatus} → {log.newStatus}
                        </p>
                      )}
                      {log.performedBy && (
                        <p className='text-xs text-muted-foreground'>
                          Usuário: {log.performedBy}
                        </p>
                      )}
                      {log.details && (
                        <p className='text-sm text-muted-foreground'>
                          {typeof log.details === 'object'
                            ? JSON.stringify(log.details, null, 2)
                            : log.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-center text-sm text-muted-foreground py-8'>
                Nenhum log de auditoria disponível
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
