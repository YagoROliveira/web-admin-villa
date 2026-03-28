import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Zone } from '../data/schema'
import { ZonesRowActions } from './zones-row-actions'

export const zonesColumns: ColumnDef<Zone>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label='Selecionar todos'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label='Selecionar'
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
      const zone = row.original
      return (
        <div>
          <span className='font-medium'>{zone.name}</span>
          {zone.displayName && (
            <p className='text-xs text-muted-foreground'>{zone.displayName}</p>
          )}
        </div>
      )
    },
  },
  {
    id: 'stores',
    header: 'Lojas',
    cell: ({ row }) => (
      <span className='text-muted-foreground'>
        {row.original._count?.stores ?? 0}
      </span>
    ),
  },
  {
    id: 'deliveryMen',
    header: 'Entregadores',
    cell: ({ row }) => (
      <span className='text-muted-foreground'>
        {row.original._count?.deliveryMen ?? 0}
      </span>
    ),
  },
  {
    id: 'modules',
    header: 'Módulos',
    cell: ({ row }) => (
      <span className='text-muted-foreground'>
        {row.original._count?.moduleZones ?? 0}
      </span>
    ),
  },
  {
    id: 'payments',
    header: 'Pagamentos',
    cell: ({ row }) => {
      const zone = row.original
      return (
        <div className='flex flex-wrap gap-1'>
          {zone.cashOnDelivery && (
            <Badge variant='outline' className='text-[10px]'>
              Dinheiro
            </Badge>
          )}
          {zone.digitalPayment && (
            <Badge variant='outline' className='text-[10px]'>
              Digital
            </Badge>
          )}
          {zone.offlinePayment && (
            <Badge variant='outline' className='text-[10px]'>
              Offline
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'destructive'}>
        {row.original.isActive ? 'Ativa' : 'Inativa'}
      </Badge>
    ),
    filterFn: (row, id, value) =>
      Array.isArray(value) ? value.includes(row.getValue(id)) : true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <ZonesRowActions row={row} />,
  },
]
