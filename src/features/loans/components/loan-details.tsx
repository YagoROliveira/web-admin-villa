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
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

    setIsLoading(true)
    setError(null)

    console.log('Buscando dados do empréstimo:', loanId)

    // Vamos tentar primeiro o endpoint que funcionou na listagem
    const url = buildApiUrl(API_CONFIG.ENDPOINTS.LOANS.GET_ANALYSIS_DATA, {
      requestId: loanId,
    })
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(
            `Erro ${res.status}: ${res.statusText} - ${errorText}`
          )
        }

        const data = await res.json()
        console.log('Data received:', data)

        // A API pode retornar um array ou um objeto direto
        let loanDetail

        if (Array.isArray(data)) {
          // Se for array, procurar pelo ID
          loanDetail = data.find((loan: any) => loan.id === loanId)
        } else if (data && typeof data === 'object') {
          // Se for objeto direto, usar os dados como estão
          loanDetail = data
        } else {
          throw new Error('Formato de dados inválido')
        }

        if (!loanDetail) {
          throw new Error('Empréstimo não encontrado')
        }

        console.log('Loan detail:', loanDetail)

        // Adaptar os dados para o formato esperado
        const adaptedData = {
          loanRequested: {
            id: loanDetail.id || loanId,
            userName: loanDetail.userName,
            phone: loanDetail.phone || '',
            email: loanDetail.email || '',
            amountRequested: loanDetail.amountRequested,
            document: loanDetail.document || '',
            paymentMethod: loanDetail.paymentMethod || '',
            cidade: loanDetail.cidade || '',
            estado: loanDetail.estado || '',
            cep: loanDetail.cep || '',
            endereco: loanDetail.endereco || '',
            approvalStatus: loanDetail.approvalStatus,
            analysisNotes: loanDetail.analysisNotes || '',
            step: loanDetail.step || '',
            valueApproved:
              loanDetail.valueApproved || loanDetail.amountRequested,
            installmentAmount: loanDetail.installmentAmount || '0',
            numberOfInstallments: loanDetail.numberOfInstallments || '1',
            dueDate: loanDetail.dueDate,
            bank: loanDetail.bank || '',
            bank_agency: loanDetail.bank_agency || '',
            bank_account: loanDetail.bank_account || '',
            pix_key: loanDetail.pix_key || '',
            createdAt: loanDetail.createdAt,
            updatedAt: loanDetail.updatedAt,
            hireloan: loanDetail.hireloan,
            loanDocuments: loanDetail.loanDocuments || [],
            installments: loanDetail.installments || [],
          },
          orders: loanDetail.orders || [],
        }

        console.log('Adapted data:', adaptedData)

        setLoanData(loanDetail)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Fetch error:', err)
        setError(err.message || 'Erro desconhecido')
        setIsLoading(false)
      })
  }, [loanId])

  if (isLoading) {
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
          <div>Carregando...</div>
        </Main>
      </>
    )
  }

  if (error) {
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
          <div className='text-red-500'>Erro: {error}</div>
        </Main>
      </>
    )
  }

  if (!loanData) {
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
          <div>Empréstimo não encontrado</div>
        </Main>
      </>
    )
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
              Detalhes do Empréstimo
            </h2>
            <p className='text-muted-foreground'>
              Solicitação de{' '}
              {loanData.loanRequested.userName?.toUpperCase() ||
                'Nome não informado'}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button
              variant='outline'
              className='space-x-1'
              onClick={() => setIsViabilityDialogOpen(true)}
            >
              <span>Análise de Viabilidade</span> <TrendingUp size={18} />
            </Button>
            <Button
              variant='outline'
              className='space-x-1'
              onClick={() => {
                /* implementar ação de solicitar dados */
              }}
            >
              <span>Solicitar Dados</span> <FileText size={18} />
            </Button>

            {/* Botões de Aprovação/Recusa - só aparecem se o status permitir */}
            {loanData.loanRequested.approvalStatus?.toLowerCase() ===
              'pending' && (
              <>
                <LoanApprovalDialog
                  loanId={loanData.loanRequested.id}
                  amountRequested={loanData.loanRequested.amountRequested}
                  userName={
                    loanData.loanRequested.userName || 'Nome não informado'
                  }
                  userId={loanData.loanRequested.id}
                >
                  <Button className='space-x-1 bg-green-600 hover:bg-green-700'>
                    <CheckCircle size={18} />
                    <span>Aprovar</span>
                  </Button>
                </LoanApprovalDialog>

                <LoanRejectionDialog
                  loanId={loanData.loanRequested.id}
                  amountRequested={loanData.loanRequested.amountRequested}
                  userName={
                    loanData.loanRequested.userName || 'Nome não informado'
                  }
                >
                  <Button variant='destructive' className='space-x-1'>
                    <XCircle size={18} />
                    <span>Rejeitar</span>
                  </Button>
                </LoanRejectionDialog>
              </>
            )}

            <Button
              variant='outline'
              className='space-x-1'
              onClick={() => setIsStatusDialogOpen(true)}
            >
              <span>Alterar Status</span> <Edit size={18} />
            </Button>
          </div>
        </div>
        {/* Indicador de Status do Empréstimo */}
        <LoanStatusIndicator
          status={loanData.loanRequested.approvalStatus}
          step={loanData.loanRequested.step}
          analysisNotes={loanData.loanRequested.analysisNotes}
          className='mb-6'
        />
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {/* Dados do Solicitante */}
          <div className='bg-card rounded-lg border p-6'>
            <h3 className='mb-4 text-lg font-semibold'>Dados do Solicitante</h3>
            <div className='space-y-2'>
              <p>
                <strong>Nome:</strong>{' '}
                {loanData.loanRequested.userName?.toUpperCase() ||
                  'Nome não informado'}
              </p>
              <p>
                <strong>Email:</strong>{' '}
                {loanData.loanRequested.email || 'Email não informado'}
              </p>
              <p>
                <strong>Telefone:</strong>{' '}
                {loanData.loanRequested.phone || 'Telefone não informado'}
              </p>
              <p>
                <strong>Documento:</strong>{' '}
                {loanData.loanRequested.document || 'Documento não informado'}
              </p>
              <p>
                <strong>Endereço:</strong>{' '}
                {loanData.loanRequested.endereco || 'Endereço não informado'}
              </p>
              <p>
                <strong>Cidade:</strong>{' '}
                {loanData.loanRequested.cidade || 'Cidade não informada'}
              </p>
              <p>
                <strong>Estado:</strong>{' '}
                {loanData.loanRequested.estado || 'Estado não informado'}
              </p>
              <p>
                <strong>CEP:</strong>{' '}
                {loanData.loanRequested.cep || 'CEP não informado'}
              </p>
            </div>
          </div>

          {/* Dados do Empréstimo */}
          <div className='bg-card rounded-lg border p-6'>
            <h3 className='mb-4 text-lg font-semibold'>Dados do Empréstimo</h3>
            <div className='space-y-2'>
              <p>
                <strong>Valor Solicitado:</strong>{' '}
                {Number(
                  loanData.loanRequested.amountRequested || 0
                ).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
              <p>
                <strong>Valor Aprovado:</strong>{' '}
                {Number(
                  loanData.loanRequested.valueApproved || 0
                ).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
              <div className='flex items-center gap-2'>
                <strong>Status:</strong>
                {(() => {
                  const statusInfo = formatLoanStatus(
                    loanData.loanRequested.approvalStatus
                  )
                  return (
                    <div className='flex items-center gap-2'>
                      <statusInfo.icon className='size-4' />
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  )
                })()}
              </div>
              <p>
                <strong>Parcelas:</strong>{' '}
                {loanData.loanRequested.numberOfInstallments || 'Não definido'}
              </p>
              <p>
                <strong>Valor da Parcela:</strong>{' '}
                {Number(
                  loanData.loanRequested.installmentAmount || 0
                ).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
              <p>
                <strong>Método de Pagamento:</strong>{' '}
                {loanData.loanRequested.paymentMethod || 'Não informado'}
              </p>
            </div>
          </div>

          {/* Dados Bancários */}
          <div className='bg-card rounded-lg border p-6'>
            <h3 className='mb-4 text-lg font-semibold'>Dados Bancários</h3>
            <div className='space-y-2'>
              <p>
                <strong>Banco:</strong>{' '}
                {loanData.loanRequested.bank || 'Banco não informado'}
              </p>
              <p>
                <strong>Agência:</strong>{' '}
                {loanData.loanRequested.bank_agency || 'Agência não informada'}
              </p>
              <p>
                <strong>Conta:</strong>{' '}
                {loanData.loanRequested.bank_account || 'Conta não informada'}
              </p>
              <p>
                <strong>Chave PIX:</strong>{' '}
                {loanData.loanRequested.pix_key || 'Chave PIX não informada'}
              </p>
            </div>
          </div>
        </div>
        {/* Documentos */}
        {loanData.loanRequested.loanDocuments &&
          loanData.loanRequested.loanDocuments.length > 0 && (
            <div className='mt-8'>
              <h3 className='mb-4 text-lg font-semibold'>Documentos</h3>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                {loanData.loanRequested.loanDocuments.map((doc) => (
                  <div key={doc.id} className='bg-card rounded-lg border p-4'>
                    <div className='mb-3'>
                      <img
                        src={doc.documentUrl}
                        alt={`Documento ${doc.documentType}`}
                        className='h-32 w-full cursor-pointer rounded object-cover transition-opacity hover:opacity-80'
                        onClick={() => window.open(doc.documentUrl, '_blank')}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const nextEl = e.currentTarget
                            .nextElementSibling as HTMLElement
                          if (nextEl) nextEl.style.display = 'flex'
                        }}
                      />
                      <div
                        className='hidden h-32 w-full cursor-pointer items-center justify-center rounded bg-gray-100 transition-colors hover:bg-gray-200'
                        onClick={() => window.open(doc.documentUrl, '_blank')}
                      >
                        <div className='text-center'>
                          <svg
                            className='mx-auto mb-2 h-8 w-8 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                          <span className='text-sm text-gray-600'>
                            Ver Documento
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <p>
                        <strong>Tipo:</strong> {doc.documentType}
                      </p>
                      <p>
                        <strong>Status:</strong> {doc.status}
                      </p>
                      <p>
                        <strong>Data:</strong> {formatDateTime(doc.createdAt)}
                      </p>
                    </div>
                    <div className='mt-3 flex gap-2'>
                      <button
                        className='flex-1 rounded bg-green-500 px-3 py-1 text-xs text-white transition-colors hover:bg-green-600'
                        onClick={() => {
                          /* implementar ação de aprovar */
                        }}
                      >
                        Aprovar
                      </button>
                      <button
                        className='flex-1 rounded bg-red-500 px-3 py-1 text-xs text-white transition-colors hover:bg-red-600'
                        onClick={() => {
                          /* implementar ação de reprovar */
                        }}
                      >
                        Reprovar
                      </button>
                      <button
                        className='flex-1 rounded bg-blue-500 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-600'
                        onClick={() => {
                          /* implementar ação de solicitar novo documento */
                        }}
                      >
                        Solicitar Novo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}{' '}
        {/* Parcelas */}
        {loanData.loanRequested.installments &&
          loanData.loanRequested.installments.length > 0 && (
            <div className='mt-8'>
              <h3 className='mb-4 text-lg font-semibold'>Parcelas</h3>
              <div className='overflow-hidden rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Valor Original</TableHead>
                      <TableHead>Valor Atual</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Pagamento</TableHead>
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
                          <TableCell>{installment.installment}</TableCell>
                          <TableCell>
                            {Number(installment.originAmount).toLocaleString(
                              'pt-BR',
                              { style: 'currency', currency: 'BRL' }
                            )}
                          </TableCell>
                          <TableCell>
                            {Number(installment.amount).toLocaleString(
                              'pt-BR',
                              { style: 'currency', currency: 'BRL' }
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDateTime(installment.dueDate)}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <statusInfo.icon className='size-4' />
                              <Badge className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                              {installment.daysLate &&
                                installment.daysLate > 0 && (
                                  <span className='text-sm text-red-600'>
                                    ({installment.daysLate} dias)
                                  </span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {installment.paymentDate
                              ? formatDateTime(installment.paymentDate)
                              : '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        {/* Histórico de Pedidos */}
        {loanData.orders && loanData.orders.length > 0 && (
          <div className='mt-8'>
            <h3 className='mb-4 text-lg font-semibold'>Histórico de Pedidos</h3>
            <div className='overflow-hidden rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status Pagamento</TableHead>
                    <TableHead>Status Pedido</TableHead>
                    <TableHead>Método Pagamento</TableHead>
                    <TableHead>Data Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loanData.orders.map((order) => {
                    const paymentStatusInfo = formatPaymentStatus(
                      order.payment_status
                    )
                    const orderStatusInfo = formatOrderStatus(
                      order.order_status
                    )

                    return (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>
                          {Number(order.order_amount).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <paymentStatusInfo.icon className='size-4' />
                            <Badge className={paymentStatusInfo.color}>
                              {paymentStatusInfo.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <orderStatusInfo.icon className='size-4' />
                            <Badge className={orderStatusInfo.color}>
                              {orderStatusInfo.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{order.payment_method}</TableCell>
                        <TableCell>
                          {formatDateTime(order.created_at)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
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
