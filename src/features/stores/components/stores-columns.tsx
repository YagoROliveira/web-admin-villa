import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Store } from '../data/schema'
import { StoresRowActions } from './stores-row-actions'

export const storesColumns: ColumnDef<Store>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nome' />
    ),
    cell: ({ row }) => {
      const store = row.original
      return (
        <div className='flex items-center gap-3'>
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className='h-8 w-8 rounded-full object-cover'
            />
          ) : (
            <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium'>
              {store.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className='font-medium'>{store.name}</div>
            {store.address && (
              <div className='text-muted-foreground text-xs truncate max-w-[200px]'>
                {store.address}
              </div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'module',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Módulo' />
    ),
    cell: ({ row }) => {
      const mod = row.original.module
      return mod ? (
        <Badge variant='outline'>{mod.name}</Badge>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'zone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Zona' />
    ),
    cell: ({ row }) => {
      const zone = row.original.zone
      return zone ? (
        <span>{zone.displayName || zone.name}</span>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'vendor',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Lojista' />
    ),
    cell: ({ row }) => {
      const vendor = row.original.vendor
      if (!vendor) return <span className='text-muted-foreground'>-</span>
      return <span>{vendor.name || vendor.email || '-'}</span>
    },
    enableSorting: false,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const active = row.getValue('isActive') as boolean
      return (
        <Badge variant={active ? 'default' : 'secondary'}>
          {active ? 'Ativa' : 'Inativa'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    accessorKey: 'isApproved',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Aprovação' />
    ),
    cell: ({ row }) => {
      const approved = row.getValue('isApproved') as boolean
      return (
        <Badge variant={approved ? 'default' : 'destructive'}>
          {approved ? 'Aprovada' : 'Pendente'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    accessorKey: 'isFeatured',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Destaque' />
    ),
    cell: ({ row }) => {
      const featured = row.getValue('isFeatured') as boolean
      return featured ? (
        <Badge variant='default'>Sim</Badge>
      ) : (
        <span className='text-muted-foreground text-sm'>Não</span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <StoresRowActions row={row} />,
  },
]
