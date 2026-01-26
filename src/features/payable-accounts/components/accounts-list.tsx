import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  XCircle,
  Filter,
  X,
} from 'lucide-react'
import type { PayableAccount, PayableAccountSummary, PayableAccountStatus } from '../types'

interface AccountsListProps {
  accounts: PayableAccount[]
  total: number
  summary?: PayableAccountSummary
  isLoading: boolean
  onRefresh: () => void
}

export function PayableAccountsList({
  accounts,
  total,
  summary,
  isLoading,
}: AccountsListProps) {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as any

  const [showFilters, setShowFilters] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: PayableAccountStatus) => {
    const variants: Record<PayableAccountStatus, { variant: any; icon: any; label: string }> = {
      pending: {
        variant: 'secondary',
        icon: Clock,
        label: 'Pendente',
      },
      approved: {
        variant: 'default',
        icon: CheckCircle2,
        label: 'Aprovada',
      },
      paid: {
        variant: 'outline',
        icon: DollarSign,
        label: 'Paga',
      },
      overdue: {
        variant: 'destructive',
        icon: AlertCircle,
        label: 'Vencida',
      },
      cancelled: {
        variant: 'outline',
        icon: XCircle,
        label: 'Cancelada',
      },
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className='gap-1'>
        <Icon size={12} />
        {config.label}
      </Badge>
    )
  }

  const handleStatusFilter = (status: string) => {
    const currentStatus = search.status || []
    const newStatus = status === 'all'
      ? []
      : currentStatus.includes(status as PayableAccountStatus)
        ? currentStatus.filter((s: string) => s !== status)
        : [...currentStatus, status as PayableAccountStatus]

    navigate({
      to: '/payable-accounts',
      search: {
        ...search,
        status: newStatus.length > 0 ? newStatus : undefined,
        page: 1,
      },
    })
  }

  const handleSearchChange = (value: string) => {
    navigate({
      to: '/payable-accounts',
      search: {
        ...search,
        search: value || undefined,
        page: 1,
      },
    })
  }

  const clearFilters = () => {
    navigate({
      to: '/payable-accounts',
      search: {
        page: 1,
        pageSize: search.pageSize || 10,
        view: 'list',
      },
    })
  }

  const hasActiveFilters =
    (search.status && search.status.length > 0) ||
    search.search ||
    search.store_id ||
    search.due_date_start ||
    search.due_date_end

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <Skeleton className='h-8 w-[200px]' />
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-16 w-full' />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      {summary && (
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Contas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{summary.total_accounts}</div>
              <p className='text-xs text-muted-foreground'>
                {formatCurrency(summary.total_amount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{summary.pending_count}</div>
              <p className='text-xs text-muted-foreground'>
                {formatCurrency(summary.pending_total)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Aprovadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{summary.approved_count}</div>
              <p className='text-xs text-muted-foreground'>
                {formatCurrency(summary.approved_total)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pagas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{summary.paid_count}</div>
              <p className='text-xs text-muted-foreground'>
                {formatCurrency(summary.paid_total)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Lista de Contas</CardTitle>
              <CardDescription>
                {total} {total === 1 ? 'conta encontrada' : 'contas encontradas'}
              </CardDescription>
            </div>
            <div className='flex gap-2'>
              {hasActiveFilters && (
                <Button variant='ghost' size='sm' onClick={clearFilters}>
                  <X size={16} className='mr-2' />
                  Limpar Filtros
                </Button>
              )}
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className='mr-2' />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className='border-t pt-6'>
            <div className='grid gap-4 md:grid-cols-3'>
              <div>
                <label className='text-sm font-medium'>Buscar</label>
                <Input
                  placeholder='Buscar por loja, descrição...'
                  value={search.search || ''}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className='mt-1.5'
                />
              </div>

              <div>
                <label className='text-sm font-medium'>Status</label>
                <Select
                  value={search.status?.length === 1 ? search.status[0] : 'all'}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger className='mt-1.5'>
                    <SelectValue placeholder='Todos os status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Todos</SelectItem>
                    <SelectItem value='pending'>Pendente</SelectItem>
                    <SelectItem value='approved'>Aprovada</SelectItem>
                    <SelectItem value='paid'>Paga</SelectItem>
                    <SelectItem value='overdue'>Vencida</SelectItem>
                    <SelectItem value='cancelled'>Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}

        <CardContent>
          {accounts.length === 0 ? (
            <div className='flex min-h-[200px] items-center justify-center rounded-lg border border-dashed'>
              <div className='text-center'>
                <p className='text-muted-foreground'>Nenhuma conta encontrada</p>
                {hasActiveFilters && (
                  <Button
                    variant='link'
                    size='sm'
                    onClick={clearFilters}
                    className='mt-2'
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loja</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className='text-right'>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className='font-medium'>
                      {account.store_name}
                    </TableCell>
                    <TableCell>
                      {account.description || '-'}
                      {account.reference_month && (
                        <p className='text-xs text-muted-foreground'>
                          Ref: {account.reference_month}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(account.due_date)}
                      {account.status === 'overdue' && (
                        <p className='text-xs text-destructive'>
                          {Math.floor(
                            (new Date().getTime() -
                              new Date(account.due_date).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )}{' '}
                          dias atraso
                        </p>
                      )}
                    </TableCell>
                    <TableCell className='text-right font-medium'>
                      {formatCurrency(account.net_amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(account.status)}</TableCell>
                    <TableCell>
                      <Button variant='ghost' size='sm'>
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {total > (search.pageSize || 10) && (
            <div className='mt-4 flex items-center justify-between border-t pt-4'>
              <div className='text-sm text-muted-foreground'>
                Mostrando {Math.min((search.page || 1) * (search.pageSize || 10), total)} de{' '}
                {total} {total === 1 ? 'conta' : 'contas'}
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={(search.page || 1) <= 1}
                  onClick={() =>
                    navigate({
                      to: '/payable-accounts',
                      search: {
                        ...search,
                        page: (search.page || 1) - 1,
                      },
                    })
                  }
                >
                  Anterior
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={
                    (search.page || 1) * (search.pageSize || 10) >= total
                  }
                  onClick={() =>
                    navigate({
                      to: '/payable-accounts',
                      search: {
                        ...search,
                        page: (search.page || 1) + 1,
                      },
                    })
                  }
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
