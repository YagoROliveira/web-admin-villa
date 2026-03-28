import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Module } from '../data/schema'
import { MODULE_TYPE_LABELS } from '../data/schema'
import { ModulesRowActions } from './modules-row-actions'

export const modulesColumns: ColumnDef<Module>[] = [
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
      const mod = row.original
      return (
        <div className='flex items-center gap-3'>
          {mod.icon ? (
            <img
              src={mod.icon}
              alt={mod.name}
              className='h-8 w-8 rounded-md object-cover'
            />
          ) : (
            <div className='flex h-8 w-8 items-center justify-center rounded-md bg-muted text-xs font-bold'>
              {mod.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <span className='font-medium'>{mod.name}</span>
            {mod.description && (
              <p className='text-xs text-muted-foreground line-clamp-1'>
                {mod.description}
              </p>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tipo' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as string
      return (
        <Badge variant='outline'>
          {MODULE_TYPE_LABELS[type] ?? type}
        </Badge>
      )
    },
    filterFn: (row, id, value) =>
      Array.isArray(value) ? value.includes(row.getValue(id)) : true,
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
    id: 'zones',
    header: 'Zonas',
    cell: ({ row }) => (
      <span className='text-muted-foreground'>
        {row.original._count?.moduleZones ?? 0}
      </span>
    ),
  },
  {
    accessorKey: 'allZoneService',
    header: 'Todas Zonas',
    cell: ({ row }) => (
      <Badge variant={row.original.allZoneService ? 'default' : 'secondary'}>
        {row.original.allZoneService ? 'Sim' : 'Não'}
      </Badge>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'destructive'}>
        {row.original.isActive ? 'Ativo' : 'Inativo'}
      </Badge>
    ),
    filterFn: (row, id, value) =>
      Array.isArray(value) ? value.includes(row.getValue(id)) : true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <ModulesRowActions row={row} />,
  },
]
