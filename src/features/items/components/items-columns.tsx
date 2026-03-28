import type { ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import type { Item } from '../data/schema'
import { ItemsRowActions } from './items-row-actions'

export const itemsColumns: ColumnDef<Item>[] = [
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
      <DataTableColumnHeader column={column} title='Produto' />
    ),
    cell: ({ row }) => {
      const item = row.original
      const img = item.images?.[0]
      return (
        <Link
          to='/items/$itemId'
          params={{ itemId: item.id }}
          className='flex items-center gap-3 hover:opacity-80 transition-opacity'
        >
          {img ? (
            <img
              src={img}
              alt={item.name}
              className='h-8 w-8 rounded object-cover'
            />
          ) : (
            <div className='bg-muted flex h-8 w-8 items-center justify-center rounded text-xs font-medium'>
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className='font-medium text-primary underline-offset-4 hover:underline'>{item.name}</div>
            {item.description && (
              <div className='text-muted-foreground text-xs truncate max-w-[200px]'>
                {item.description}
              </div>
            )}
          </div>
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
      return store ? (
        <span className='text-sm'>{store.name}</span>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Categoria' />
    ),
    cell: ({ row }) => {
      const cat = row.original.category
      return cat ? (
        <Badge variant='outline'>{cat.name}</Badge>
      ) : (
        <span className='text-muted-foreground'>-</span>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Preço' />
    ),
    cell: ({ row }) => {
      const price = row.original.price
      return (
        <span className='font-medium'>
          R$ {Number(price).toFixed(2)}
        </span>
      )
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estoque' />
    ),
    cell: ({ row }) => {
      const stock = row.original.stock
      if (stock === null || stock === undefined) {
        return <span className='text-muted-foreground'>-</span>
      }
      return (
        <Badge variant={stock > 0 ? 'outline' : 'destructive'}>
          {stock}
        </Badge>
      )
    },
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
          {active ? 'Ativo' : 'Inativo'}
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
        <Badge variant={approved ? 'default' : 'outline'}>
          {approved ? 'Aprovado' : 'Pendente'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
  },
  {
    id: 'actions',
    cell: ({ row }) => <ItemsRowActions row={row} />,
  },
]
