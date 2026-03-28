import { type ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { statusDisplay, roles } from '../data/data'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<User>[] = [
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
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cliente' />
    ),
    cell: ({ row }) => {
      const { avatarUrl, name } = row.original
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
      return (
        <Link
          to='/users/$userId'
          params={{ userId: row.original.id }}
          className='flex items-center gap-2.5 ps-1 font-medium text-primary hover:underline'
        >
          <Avatar className='h-8 w-8'>
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
          </Avatar>
          <span className='max-w-[160px] truncate'>{name}</span>
        </Link>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('email') || '—'}</div>
    ),
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Telefone' />
    ),
    cell: ({ row }) => <div>{row.getValue('phone') || '—'}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'walletBalance',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Saldo' />
    ),
    cell: ({ row }) => {
      const balance = Number(row.original.walletBalance)
      return (
        <div className={cn('font-medium tabular-nums', balance > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>
          R$ {balance.toFixed(2)}
        </div>
      )
    },
  },
  {
    accessorKey: 'loyaltyPoints',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pontos' />
    ),
    cell: ({ row }) => (
      <div className='font-medium tabular-nums text-amber-600'>
        {row.original.loyaltyPoints}
      </div>
    ),
  },
  {
    id: 'orders',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Pedidos' />
    ),
    cell: ({ row }) => (
      <div className='text-center tabular-nums'>
        {row.original._count?.orders ?? 0}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isActive = row.original.isActive
      const display = statusDisplay.get(isActive) ?? { label: '—', className: '' }
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', display.className)}>
            {display.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, _id, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      const isActive = row.original.isActive
      return value.includes(isActive ? 'ACTIVE' : 'INACTIVE')
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const { role } = row.original
      const userType = roles.find(({ value }) => value === role)

      return (
        <div className='flex items-center gap-x-2'>
          {userType?.icon && (
            <userType.icon size={16} className='text-muted-foreground' />
          )}
          <span className='text-sm capitalize'>{userType?.label ?? role}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cadastro' />
    ),
    cell: ({ row }) => (
      <div className='text-muted-foreground text-nowrap text-sm'>
        {new Date(row.original.createdAt).toLocaleDateString('pt-BR')}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
