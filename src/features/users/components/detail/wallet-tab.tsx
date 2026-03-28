import { useState } from 'react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUserWallet, useAddFund } from '../../hooks/use-user-detail'

const txTypeLabels: Record<string, { label: string; color: string }> = {
  add_fund: { label: 'Depósito', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  order_place: { label: 'Pedido', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  order_refund: { label: 'Reembolso', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  cashback: { label: 'Cashback', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  referral_bonus: { label: 'Bônus Indicação', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  loyalty_exchange: { label: 'Troca Pontos', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
}

interface WalletTabProps {
  userId: string
  walletBalance: number
}

export function WalletTab({ userId, walletBalance }: WalletTabProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useUserWallet(userId, page)
  const addFundMutation = useAddFund(userId)

  const [addFundOpen, setAddFundOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [reference, setReference] = useState('')

  const handleAddFund = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    addFundMutation.mutate(
      { amount: numAmount, reference: reference || undefined },
      {
        onSuccess: () => {
          setAddFundOpen(false)
          setAmount('')
          setReference('')
        },
      },
    )
  }

  const transactions = data?.items ?? []

  return (
    <div className='space-y-4'>
      {/* Wallet Balance Card */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Saldo Atual</CardDescription>
            <CardTitle className='text-3xl text-emerald-600'>
              R$ {walletBalance.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={addFundOpen} onOpenChange={setAddFundOpen}>
              <DialogTrigger asChild>
                <Button size='sm' className='w-full'>
                  <Plus className='mr-2 h-4 w-4' />
                  Adicionar Saldo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Saldo</DialogTitle>
                  <DialogDescription>
                    Adicionar fundos à carteira do cliente
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='amount'>Valor (R$)</Label>
                    <CurrencyInput
                      id='amount'
                      value={Number(amount) || 0}
                      onChange={(v) => setAmount(String(v))}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='reference'>Referência (opcional)</Label>
                    <Input
                      id='reference'
                      placeholder='Motivo do crédito...'
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant='outline' onClick={() => setAddFundOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAddFund}
                    disabled={addFundMutation.isPending || !amount}
                  >
                    {addFundMutation.isPending ? 'Adicionando...' : 'Confirmar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardDescription>Total de Transações</CardDescription>
            <CardTitle className='text-2xl'>{data?.total ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Wallet className='h-5 w-5' />
            Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p className='text-muted-foreground py-8 text-center'>
              Nenhuma transação encontrada
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Crédito</TableHead>
                    <TableHead>Débito</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Referência</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const typeInfo = txTypeLabels[tx.type] ?? { label: tx.type, color: 'bg-gray-100 text-gray-800' }
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <Badge className={typeInfo.color} variant='outline'>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {Number(tx.credit) > 0 ? (
                            <span className='flex items-center gap-1 text-emerald-600'>
                              <ArrowDownCircle className='h-4 w-4' />
                              R$ {Number(tx.credit).toFixed(2)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          {Number(tx.debit) > 0 ? (
                            <span className='flex items-center gap-1 text-red-600'>
                              <ArrowUpCircle className='h-4 w-4' />
                              R$ {Number(tx.debit).toFixed(2)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className='font-medium'>
                          R$ {Number(tx.balance).toFixed(2)}
                        </TableCell>
                        <TableCell className='text-muted-foreground text-xs'>
                          {tx.referenceType ?? '—'}
                        </TableCell>
                        <TableCell className='text-muted-foreground text-xs'>
                          {new Date(tx.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className='mt-4 flex items-center justify-between'>
                  <p className='text-muted-foreground text-sm'>
                    Página {data.page} de {data.totalPages} ({data.total} transações)
                  </p>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
