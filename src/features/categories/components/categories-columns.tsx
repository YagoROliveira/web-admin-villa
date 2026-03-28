import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Category } from '../data/schema'
import { CategoriesRowActions } from './categories-row-actions'

export const categoriesColumns: ColumnDef<Category>[] = [
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
      const category = row.original
      return (
        <div className='flex items-center gap-3'>
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name}
              className='h-8 w-8 rounded object-cover'
            />
          ) : (
            <div className='bg-muted flex h-8 w-8 items-center justify-center rounded text-xs font-medium'>
              {category.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className='font-medium'>{category.name}</div>
            {category.parent && (
              <div className='text-muted-foreground text-xs'>
                em {category.parent.name}
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
    accessorKey: 'position',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Posição' />
    ),
    cell: ({ row }) => <span>{row.original.position}</span>,
  },
  {
    id: 'items',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Itens' />
    ),
    cell: ({ row }) => {
      const count = row.original._count?.items
      return (
        <span className='text-muted-foreground'>
          {count != null ? count : '-'}
        </span>
      )
    },
    enableSorting: false,
  },
  {
    id: 'subcategories',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Subcategorias' />
    ),
    cell: ({ row }) => {
      const children = row.original.children
      return (
        <span className='text-muted-foreground'>
          {children?.length ?? 0}
        </span>
      )
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
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CategoriesRowActions row={row} />,
  },
]
