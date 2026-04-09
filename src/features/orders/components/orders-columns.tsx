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
  return `R$ ${Number(value).toFixed(2)}`
}

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return '-'
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
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pedido' />
    ),
    cell: ({ row }) => (
      <Link
        to='/admin/orders/$orderId'
        params={{ orderId: String(row.original.id) }}
        className='font-mono text-xs text-primary hover:underline'
      >
        #{row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: 'store_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Loja' />
    ),
    cell: ({ row }) => {
      const storeName = row.original.store_name ?? row.original.store?.name
      if (storeName) {
        return (
          <div className='flex items-center gap-2'>
            <div className='bg-muted flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium'>
              {storeName.charAt(0)}
            </div>
            <span className='max-w-[120px] truncate text-sm'>{storeName}</span>
          </div>
        )
      }
      return <span className='text-muted-foreground text-xs'>Loja #{row.original.store_id}</span>
    },
  },
  {
    accessorKey: 'user_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      const customerName =
        row.original.customer_name ||
        [row.original.customer?.f_name, row.original.customer?.l_name].filter(Boolean).join(' ') ||
        null
      const phone = row.original.customer_phone ?? row.original.customer?.phone
      if (customerName) {
        return (
          <div>
            <div className='text-sm font-medium'>{customerName}</div>
            {phone && (
              <div className='text-muted-foreground text-xs'>{phone}</div>
            )}
          </div>
        )
      }
      return <span className='text-muted-foreground text-xs'>#{row.original.user_id}</span>
    },
  },
  {
    accessorKey: 'order_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const label = ORDER_TYPE_LABELS[row.original.order_type] ?? row.original.order_type
      return <Badge variant='outline'>{label}</Badge>
    },
  },
  {
    accessorKey: 'order_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const info = ORDER_STATUS_LABELS[row.original.order_status] ?? {
        label: row.original.order_status,
        color: 'bg-gray-100 text-gray-800',
      }
      return (
        <Badge className={`${info.color} border-0 font-medium`}>
          {info.label}
        </Badge>
      )
    },
    filterFn: (row, _id, value) => value.includes(row.getValue('order_status')),
  },
  {
    accessorKey: 'payment_status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pagamento' />
    ),
    cell: ({ row }) => {
      const info = PAYMENT_STATUS_LABELS[row.original.payment_status] ?? {
        label: row.original.payment_status,
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
    accessorKey: 'payment_method',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Método' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground text-xs'>
        {PAYMENT_METHOD_LABELS[row.original.payment_method] ?? row.original.payment_method}
      </span>
    ),
  },
  {
    accessorKey: 'order_amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => (
      <span className='font-semibold'>
        {formatCurrency(row.original.order_amount)}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Data' />
    ),
    cell: ({ row }) => (
      <span className='text-muted-foreground text-xs'>
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className='flex items-center justify-end'>
        <OrdersRowActions row={row} />
      </div>
    ),
  },
]
