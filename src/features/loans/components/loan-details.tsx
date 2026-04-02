import { useEffect, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { buildApiUrl, API_CONFIG } from '@/config/api'
import {
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Package,
  Edit,
  FileText,
  TrendingUp,
  Upload,
  Wallet,
  FileImage,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LoanApprovalDialog } from './loan-approval-dialog'
import { LoanRejectionDialog } from './loan-rejection-dialog'
import { LoanStatusChangeDialog } from './loan-status-change-dialog'
import { LoanStatusIndicator } from './loan-status-indicator'
import { LoanViabilityDialog } from './loan-viability-dialog'
import { LoanPaymentProofDialog } from './loan-payment-proof-dialog'
import { LoanDisbursementDialog } from './loan-disbursement-dialog'
import { LoanNotificationDialog } from './loan-notification-dialog'

// Tipo para os dados detalhados do empréstimo
interface LoanDetailsResponse {
  loanRequested: {
    id: string
    userName: string
    phone: string
    amountRequested: string
    document: string
    paymentMethod: string
    email: string
    cidade: string
    estado: string
    cep: string
    endereco: string
    approvalStatus: string
    loanStatus: string
    analysisNotes: string
    step: string
    valueApproved: string
    installmentAmount: string
    numberOfInstallments: string
    dueDate: string | null
    bank: string
    bank_agency: string
    bank_account: string
    pix_key: string
    createdAt: string
    updatedAt: string
    hireloan: string | null
    loanDocuments: Array<{
      id: string
      requestId: string
      userName: string
      documentNumber: string
      documentType: string
      documentUrl: string
      status: string
      createdAt: string
      updatedAt: string
    }>
    installments: Array<{
      id: string
      loanId: string
      installment: string
      paymentMethod: string | null
      originAmount: string
      amount: string
      paymentDate: string | null
      dueDate: string
      daysLate: number | null
      createdAt: string
      updatedAt: string
    }>
  }
  orders: Array<{
    id: string
    user_id: string
    order_amount: string
    payment_status: string
    order_status: string
    payment_method: string
    created_at: string
    updated_at: string
    [key: string]: any
  }>
}

// ─── Helpers ───

function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className='flex items-start justify-between gap-4 border-b py-2.5 text-sm last:border-0'>
      <span className='shrink-0 text-muted-foreground'>{label}</span>
      <span className='break-all text-right font-medium'>
        {value || <span className='font-normal italic text-muted-foreground/50'>—</span>}
      </span>
    </div>
  )
}

function DocRow({
  doc,
  formatDateTime,
}: {
  doc: {
    id: string
    documentType: string
    documentUrl: string
    status: string
    createdAt: string
  }
  formatDateTime: (d: string) => string
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const [preview, setPreview] = useState(false)

  return (
    <>
      <TableRow
        className='cursor-pointer select-none hover:bg-muted/50'
        onClick={() => setPreview((p) => !p)}
      >
        {/* Miniatura */}
        <TableCell className='w-14 py-2'>
          <div className='group relative size-10 overflow-hidden rounded border bg-muted'>
            {!imgFailed ? (
              <img
                src={doc.documentUrl}
                alt={doc.documentType}
                className='size-full object-cover'
                onError={() => setImgFailed(true)}
              />
            ) : (
              <FileImage className='m-auto size-5 text-muted-foreground' />
            )}
          </div>
        </TableCell>

        {/* Tipo */}
        <TableCell className='text-sm font-medium'>{doc.documentType || '—'}</TableCell>

        {/* Status */}
        <TableCell>
          <Badge variant='outline' className='text-xs'>{doc.status}</Badge>
        </TableCell>

        {/* Data */}
        <TableCell className='text-sm text-muted-foreground'>
          {formatDateTime(doc.createdAt)}
        </TableCell>

        {/* Ações */}
        <TableCell className='text-right'>
          <div className='flex items-center justify-end gap-1.5' onClick={(e) => e.stopPropagation()}>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 px-2 text-xs'
              onClick={() => window.open(doc.documentUrl, '_blank')}
            >
              <ExternalLink size={12} /> Abrir
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50'
              onClick={() => {}}
            >
              Aprovar
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50'
              onClick={() => {}}
            >
              Reprovar
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Linha de prévia expandível */}
      {preview && (
        <TableRow>
          <TableCell colSpan={5} className='bg-muted/30 pb-4 pt-2'>
            <img
              src={doc.documentUrl}
              alt={doc.documentType}
              className='max-h-72 rounded-md object-contain'
              onError={() => setImgFailed(true)}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function LoanDetails() {
  const { loanId } = useParams({ from: '/_authenticated/loans/$loanId' })
  const [loanData, setLoanData] = useState<LoanDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isViabilityDialogOpen, setIsViabilityDialogOpen] = useState(false)

  // Função para lidar com a alteração de status
  const handleStatusChange = (data: { status: string; reason: string }) => {
    console.log('Alteração de status:', data)
    // Aqui você implementaria a lógica para enviar a alteração para a API
    // Por exemplo: updateLoanStatus(loanId, data.status, data.reason)
  }

  // Função para formatar moeda
  const formatCurrency = (value: string | number) =>
    Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  // Função para formatar status do empréstimo
  const formatLoanStatus = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; icon: any }
    > = {
      pending: {
        label: 'Pendente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      approved: {
        label: 'Aprovado',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      rejected: {
        label: 'Recusado',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
      analysis: {
        label: 'Em Análise',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
      },
      pendente: {
        label: 'Pendente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      aprovado: {
        label: 'Aprovado',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      recusado: {
        label: 'Recusado',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
    }
    return (
      statusMap[status?.toLowerCase() || ''] || {
        label: status || 'Status não informado',
        color: 'bg-gray-100 text-gray-800',
        icon: Clock,
      }
    )
  }

  // Função para formatar status de pagamento
  const formatPaymentStatus = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; icon: any }
    > = {
      pending: {
        label: 'Pendente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      paid: {
        label: 'Pago',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      overdue: {
        label: 'Em Atraso',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
      canceled: {
        label: 'Cancelado',
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
      },
    }
    return (
      statusMap[status] || {
        label: status,
        color: 'bg-gray-100 text-gray-800',
        icon: Clock,
      }
    )
  }

  // Função para formatar status do pedido
  const formatOrderStatus = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; color: string; icon: any }
    > = {
      pending: {
        label: 'Pendente',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
      },
      confirmed: {
        label: 'Confirmado',
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
      },
      delivered: {
        label: 'Entregue',
        color: 'bg-green-100 text-green-800',
        icon: Truck,
      },
      canceled: {
        label: 'Cancelado',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
      },
    }
    return (
      statusMap[status] || {
        label: status,
        color: 'bg-gray-100 text-gray-800',
        icon: Package,
      }
    )
  }

  // Função para formatar data e hora
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    if (!loanId) return

    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    const url = buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.GET_ANALYSIS_DATA, {
      requestId: loanId,
    })

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Erro ${res.status}: ${res.statusText} - ${errorText}`)
        }
        const data = await res.json()
        let loanDetail
        if (Array.isArray(data)) {
          loanDetail = data.find((loan: any) => loan.id === loanId)
        } else if (data && typeof data === 'object') {
          loanDetail = data
        } else {
          throw new Error('Formato de dados inválido')
        }
        if (!loanDetail) throw new Error('Empréstimo não encontrado')
        setLoanData(loanDetail)
        setIsLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message || 'Erro desconhecido')
        setIsLoading(false)
      })

    return () => controller.abort()
  }, [loanId])

  const pageHeader = (
    <Header fixed>
      <Search />
      <div className='ms-auto flex items-center space-x-4'>
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </div>
    </Header>
  )

  if (isLoading) {
    return (
      <>
        {pageHeader}
        <Main>
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='size-8 animate-spin text-muted-foreground' />
          </div>
        </Main>
      </>
    )
  }

  if (error) {
    return (
      <>
        {pageHeader}
        <Main>
          <div className='rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-destructive'>
            <p className='font-medium'>Erro ao carregar empréstimo</p>
            <p className='mt-1 text-sm opacity-80'>{error}</p>
          </div>
        </Main>
      </>
    )
  }

  if (!loanData) {
    return (
      <>
        {pageHeader}
        <Main>
          <div className='rounded-lg border p-6 text-center text-muted-foreground'>
            Empréstimo não encontrado.
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      {pageHeader}
      <Main>
        {/* Cabeçalho */}
        <div className='mb-6'>
          <div className='mb-4 flex flex-wrap items-start justify-between gap-4'>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>
                Detalhes do Empréstimo
              </h2>
              <p className='text-muted-foreground'>
                Solicitação de{' '}
                <span className='font-medium text-foreground'>
                  {loanData.loanRequested.userName?.toUpperCase() || '—'}
                </span>
              </p>
            </div>

            {/* Ações secundárias (sempre visíveis) */}
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsViabilityDialogOpen(true)}
              >
                <TrendingUp size={15} />
                Análise de Viabilidade
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {}}
              >
                <FileText size={15} />
                Solicitar Dados
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsStatusDialogOpen(true)}
              >
                <Edit size={15} />
                Alterar Status
              </Button>
              <LoanNotificationDialog
                loanRequestId={loanData.loanRequested.id}
                userName={loanData.loanRequested.userName || 'Usuário'}
                overdueAmount={
                  loanData.loanRequested.installments
                    ?.filter((i) => i.dueDate && new Date(i.dueDate) < new Date() && !i.paymentDate)
                    .reduce((s, i) => s + parseFloat(i.amount || '0'), 0) || 0
                }
                overdueDays={
                  loanData.loanRequested.installments
                    ?.filter((i) => i.dueDate && new Date(i.dueDate) < new Date() && !i.paymentDate)
                    .map((i) => Math.ceil(Math.abs(Date.now() - new Date(i.dueDate).getTime()) / 86400000))
                    .reduce((max, d) => Math.max(max, d), 0) || undefined
                }
              />
            </div>
          </div>

          {/* Ações primárias contextuais */}
          {(() => {
            const status = loanData.loanRequested.approvalStatus?.toLowerCase()
            const loanStatus = loanData.loanRequested.loanStatus?.toLowerCase()
            const primaryActions = []

            if (status === 'pending') {
              primaryActions.push(
                <LoanApprovalDialog
                  key='approve'
                  loanId={loanData.loanRequested.id}
                  amountRequested={loanData.loanRequested.amountRequested}
                  userName={loanData.loanRequested.userName || ''}
                  userId={loanData.loanRequested.id}
                >
                  <Button className='bg-green-600 hover:bg-green-700'>
                    <CheckCircle size={16} /> Aprovar
                  </Button>
                </LoanApprovalDialog>,
                <LoanRejectionDialog
                  key='reject'
                  loanId={loanData.loanRequested.id}
                  amountRequested={loanData.loanRequested.amountRequested}
                  userName={loanData.loanRequested.userName || ''}
                >
                  <Button variant='destructive'>
                    <XCircle size={16} /> Rejeitar
                  </Button>
                </LoanRejectionDialog>
              )
            }

            if (status === 'approved') {
              primaryActions.push(
                <LoanDisbursementDialog
                  key='disburse'
                  loanId={loanData.loanRequested.id}
                  userName={loanData.loanRequested.userName || ''}
                  valueApproved={loanData.loanRequested.valueApproved}
                  onSuccess={() => window.location.reload()}
                >
                  <Button className='bg-green-600 hover:bg-green-700'>
                    <Wallet size={16} /> Marcar como Desembolsado
                  </Button>
                </LoanDisbursementDialog>
              )
            }

            if (['disbursed', 'active', 'in_progress'].includes(loanStatus ?? '')) {
              primaryActions.push(
                <LoanPaymentProofDialog
                  key='proof'
                  loanId={loanData.loanRequested.id}
                  userName={loanData.loanRequested.userName || ''}
                  amountPaid={loanData.loanRequested.valueApproved}
                  onSuccess={() => window.location.reload()}
                >
                  <Button variant='outline'>
                    <Upload size={16} /> Enviar Comprovante
                  </Button>
                </LoanPaymentProofDialog>
              )
            }

            if (primaryActions.length === 0) return null

            return (
              <div className='flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3'>
                <span className='text-sm font-medium text-muted-foreground'>Ações:</span>
                {primaryActions}
              </div>
            )
          })()}
        </div>
        {/* Indicador de Status do Empréstimo */}
        <LoanStatusIndicator
          status={loanData.loanRequested.approvalStatus}
          step={loanData.loanRequested.step}
          analysisNotes={loanData.loanRequested.analysisNotes}
          className='mb-6'
        />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {/* Dados do Solicitante */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Dados do Solicitante</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow
                label='Nome'
                value={loanData.loanRequested.userName?.toUpperCase()}
              />
              <InfoRow
                label='Email'
                value={loanData.loanRequested.email}
              />
              <InfoRow
                label='Telefone'
                value={loanData.loanRequested.phone}
              />
              <InfoRow
                label='Documento'
                value={loanData.loanRequested.document}
              />
              <InfoRow
                label='Endereço'
                value={loanData.loanRequested.endereco}
              />
              <InfoRow
                label='Cidade / UF'
                value={
                  [loanData.loanRequested.cidade, loanData.loanRequested.estado]
                    .filter(Boolean)
                    .join(' / ') || null
                }
              />
              <InfoRow
                label='CEP'
                value={loanData.loanRequested.cep}
              />
            </CardContent>
          </Card>

          {/* Dados do Empréstimo */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Dados do Empréstimo</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow
                label='Valor Solicitado'
                value={formatCurrency(loanData.loanRequested.amountRequested)}
              />
              <InfoRow
                label='Valor Aprovado'
                value={formatCurrency(loanData.loanRequested.valueApproved)}
              />
              <InfoRow
                label='Status'
                value={(() => {
                  const s = formatLoanStatus(loanData.loanRequested.approvalStatus)
                  return (
                    <div className='flex items-center gap-1.5'>
                      <s.icon className='size-3.5' />
                      <Badge className={s.color}>{s.label}</Badge>
                    </div>
                  )
                })()}
              />
              <InfoRow
                label='Parcelas'
                value={loanData.loanRequested.numberOfInstallments}
              />
              <InfoRow
                label='Valor da Parcela'
                value={formatCurrency(loanData.loanRequested.installmentAmount)}
              />
              <InfoRow
                label='Forma de Pagamento'
                value={loanData.loanRequested.paymentMethod}
              />
              <InfoRow
                label='Criado em'
                value={formatDateTime(loanData.loanRequested.createdAt)}
              />
            </CardContent>
          </Card>

          {/* Dados Bancários */}
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-base'>Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow
                label='Banco'
                value={loanData.loanRequested.bank}
              />
              <InfoRow
                label='Agência'
                value={loanData.loanRequested.bank_agency}
              />
              <InfoRow
                label='Conta'
                value={loanData.loanRequested.bank_account}
              />
              <InfoRow
                label='Chave PIX'
                value={loanData.loanRequested.pix_key}
              />
            </CardContent>
          </Card>
        </div>
        {/* Documentos */}
        {loanData.loanRequested.loanDocuments &&
          loanData.loanRequested.loanDocuments.length > 0 && (
            <div className='mt-8'>
              <h3 className='mb-4 text-lg font-semibold'>
                Documentos{' '}
                <span className='ml-1 text-sm font-normal text-muted-foreground'>
                  ({Array.from(new Map(loanData.loanRequested.loanDocuments.map((d) => [d.id, d])).values()).length})
                </span>
              </h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-14'>Prévia</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className='text-right'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(
                      new Map(
                        loanData.loanRequested.loanDocuments.map((d) => [d.id, d])
                      ).values()
                    ).map((doc) => (
                      <DocRow
                        key={doc.id}
                        doc={doc}
                        formatDateTime={formatDateTime}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}
        {/* Parcelas */}
        {loanData.loanRequested.installments &&
          loanData.loanRequested.installments.length > 0 && (
            <div className='mt-8'>
              <h3 className='mb-4 text-lg font-semibold'>Parcelas</h3>
              <Card>
                <div className='overflow-hidden rounded-lg'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-20'>Nº</TableHead>
                        <TableHead>Valor Original</TableHead>
                        <TableHead>Valor Atual</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loanData.loanRequested.installments.map((installment) => {
                        const paymentStatus = installment.paymentDate
                          ? 'paid'
                          : installment.daysLate && installment.daysLate > 0
                            ? 'overdue'
                            : 'pending'
                        const statusInfo = formatPaymentStatus(paymentStatus)

                        return (
                          <TableRow key={installment.id}>
                            <TableCell className='font-medium'>
                              {installment.installment}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(installment.originAmount)}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(installment.amount)}
                            </TableCell>
                            <TableCell>
                              {formatDateTime(installment.dueDate)}
                            </TableCell>
                            <TableCell>
                              {installment.paymentDate
                                ? formatDateTime(installment.paymentDate)
                                : <span className='text-muted-foreground'>—</span>}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-1.5'>
                                <statusInfo.icon className='size-3.5' />
                                <Badge className={statusInfo.color}>
                                  {statusInfo.label}
                                </Badge>
                                {installment.daysLate && installment.daysLate > 0 && (
                                  <span className='text-xs text-red-600'>
                                    ({installment.daysLate}d)
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}
        {/* Histórico de Pedidos */}
        {loanData.orders && loanData.orders.length > 0 && (
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold'>Histórico de Pedidos</h3>
            <Card>
              <div className='overflow-hidden rounded-lg'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-28'>ID</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Pgto</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanData.orders.map((order) => {
                      const paymentStatusInfo = formatPaymentStatus(order.payment_status)
                      const orderStatusInfo = formatOrderStatus(order.order_status)

                      return (
                        <TableRow key={order.id}>
                          <TableCell className='font-mono text-xs text-muted-foreground'>
                            {String(order.id).slice(0, 8)}…
                          </TableCell>
                          <TableCell>{formatCurrency(order.order_amount)}</TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1.5'>
                              <paymentStatusInfo.icon className='size-3.5' />
                              <Badge className={paymentStatusInfo.color}>
                                {paymentStatusInfo.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-1.5'>
                              <orderStatusInfo.icon className='size-3.5' />
                              <Badge className={orderStatusInfo.color}>
                                {orderStatusInfo.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{order.payment_method}</TableCell>
                          <TableCell>{formatDateTime(order.created_at)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        )}
      </Main>

      {/* Modal de Alteração de Status */}
      <LoanStatusChangeDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onSubmit={handleStatusChange}
      />

      {/* Modal de Análise de Viabilidade */}
      {loanData && (
        <LoanViabilityDialog
          open={isViabilityDialogOpen}
          onOpenChange={setIsViabilityDialogOpen}
          loanData={{
            id: loanData.loanRequested.id,
            amountRequested: loanData.loanRequested.amountRequested,
            valueApproved: loanData.loanRequested.valueApproved,
            installmentAmount: loanData.loanRequested.installmentAmount,
            numberOfInstallments: loanData.loanRequested.numberOfInstallments,
            createdAt: loanData.loanRequested.createdAt,
            installments: loanData.loanRequested.installments,
          }}
        />
      )}
    </>
  )
}
