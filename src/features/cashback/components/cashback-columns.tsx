import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Send, RotateCcw } from 'lucide-react'
import { Cashback } from '../types'
import { CashbackStatusBadge, CashbackTypeBadge } from './cashback-badges'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const cashbackColumns: ColumnDef<Cashback>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Selecionar todos'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Selecionar linha'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'orderId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pedido' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('orderId')}</div>
    ),
  },
  {
    accessorKey: 'userId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Usuário' />
    ),
    cell: ({ row }) => (
      <div className='font-mono text-xs text-muted-foreground'>
        {row.getValue('userId')}
      </div>
    ),
  },
  {
    accessorKey: 'cashbackType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => (
      <CashbackTypeBadge type={row.getValue('cashbackType')} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'orderAmountReais',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valor Pedido' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('orderAmountReais') as number
      return (
        <div className='font-medium'>
          {amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'cashbackPercentage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='%' />
    ),
    cell: ({ row }) => {
      const percentage = row.getValue('cashbackPercentage') as number | null
      return percentage ? (
        <div className='text-sm font-medium'>{percentage}%</div>
      ) : (
        <span className='text-xs text-muted-foreground'>N/A</span>
      )
    },
  },
  {
    accessorKey: 'cashbackAmountReais',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cashback' />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('cashbackAmountReais') as number
      return (
        <div className='font-bold text-green-600'>
          {amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => <CashbackStatusBadge status={row.getValue('status')} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return (
        <div className='text-sm'>
          {format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </div>
      )
    },
  },
  {
    accessorKey: 'campaignId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Campanha' />
    ),
    cell: ({ row }) => {
      const campaignId = row.getValue('campaignId') as string | null
      return campaignId ? (
        <div className='text-xs'>{campaignId}</div>
      ) : (
        <span className='text-xs text-muted-foreground'>-</span>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const cashback = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Abrir menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(cashback.orderId)}
            >
              Copiar ID do Pedido
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Eye className='mr-2 h-4 w-4' />
              Ver Detalhes
            </DropdownMenuItem>
            {cashback.status === 'PENDING' && (
              <DropdownMenuItem>
                <RotateCcw className='mr-2 h-4 w-4' />
                Processar
              </DropdownMenuItem>
            )}
            {cashback.status === 'COMPLETED' && !cashback.notificationSent && (
              <DropdownMenuItem>
                <Send className='mr-2 h-4 w-4' />
                Enviar Notificação
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
