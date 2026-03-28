import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Order } from '../data/schema'
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_TYPE_LABELS,
} from '../data/schema'
import { OrdersRowActions } from './orders-row-actions'

function formatCurrency(value: number | undefined | null) {
  if (value == null) return '-'
  return `R$ ${value.toFixed(2)}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const ordersColumns: ColumnDef<Order>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Selecionar todas'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Selecionar linha'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'trackingId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pedido' />
    ),
    cell: ({ row }) => {
      const tracking = row.original.trackingId
      return (
        <Link
          to='/admin/orders/$orderId'
          params={{ orderId: row.original.id }}
          className='font-mono text-xs text-primary hover:underline'
        >
          #{tracking}
        </Link>
      )
    },
  },
  {
    accessorKey: 'store',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Loja' />
    ),
    cell: ({ row }) => {
      const store = row.original.store
      if (!store) return <span className='text-muted-foreground'>-</span>
      return (
        <div className='flex items-center gap-2'>
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className='h-6 w-6 rounded-full object-cover'
            />
          ) : (
            <div className='bg-muted flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium'>
              {store.name.charAt(0)}
            </div>
          )}
          <span className='max-w-[120px] truncate text-sm'>{store.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      const user = row.original.user
      if (!user) return <span className='text-muted-foreground'>Convidado</span>
      return (
        <div>
          <div className='text-sm font-medium'>{user.name || 'Sem nome'}</div>
          {user.phone && (
            <div className='text-muted-foreground text-xs'>{user.phone}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'orderType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const label = ORDER_TYPE_LABELS[row.original.orderType] ?? row.original.orderType
      return <Badge variant='outline'>{label}</Badge>
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const info = ORDER_STATUS_LABELS[row.original.status] ?? {
        label: row.original.status,
        color: 'bg-gray-100 text-gray-800',
      }
      return (
        <Badge className={`${info.color} border-0 font-medium`}>
          {info.label}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => value.includes(row.getValue('status')),
  },
  {
    accessorKey: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pagamento' />
    ),
    cell: ({ row }) => {
      const info = PAYMENT_STATUS_LABELS[row.original.paymentStatus] ?? {
        label: row.original.paymentStatus,
        color: 'bg-gray-100 text-gray-800',
      }
      return (
        <Badge className={`${info.color} border-0 text-xs`}>
          {info.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Método' />
    ),
    cell: ({ row }) => {
      return (
        <span className='text-muted-foreground text-xs'>
          {PAYMENT_METHOD_LABELS[row.original.paymentMethod] ?? row.original.paymentMethod}
        </span>
      )
    },
  },
  {
    id: 'total',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const amounts = row.original.amounts
      return (
        <span className='font-semibold'>
          {formatCurrency(amounts?.total)}
        </span>
      )
    },
  },
  {
    id: 'items',
    header: 'Itens',
    cell: ({ row }) => {
      const count = row.original._count?.items ?? row.original.items?.length ?? '-'
      return <span className='text-muted-foreground text-xs'>{count}</span>
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground text-xs'>
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <OrdersRowActions row={row} />,
  },
]
