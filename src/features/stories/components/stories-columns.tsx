import { type ColumnDef } from '@tanstack/react-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { statuses } from '../data/schema'
import { type Story } from '../data/schema'
import { StoriesActions } from './stories-actions'

export const storiesColumns: ColumnDef<Story>[] = [
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
        aria-label='Selecionar todos'
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
      const story = row.original
      return (
        <div className='flex items-center space-x-3'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src={story.images?.[0]?.url} alt={story.name} />
            <AvatarFallback>
              {story.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className='font-medium'>{story.name}</div>
            <div className='text-muted-foreground text-sm'>ID: {story.id}</div>
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
      return (
        <div className='w-[100px]'>
          <Badge variant='outline'>{row.getValue('module')}</Badge>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        (status) => status.value === row.getValue('status')
      )

      if (!status) {
        return null
      }

      const getStatusColor = (value: string) => {
        switch (value) {
          case 'ACTIVE':
            return 'bg-green-100 text-green-800'
          case 'INACTIVE':
            return 'bg-gray-100 text-gray-800'
          case 'SCHEDULED':
            return 'bg-blue-100 text-blue-800'
          case 'PAUSED':
            return 'bg-yellow-100 text-yellow-800'
          case 'CONCLUDED':
            return 'bg-purple-100 text-purple-800'
          default:
            return 'bg-gray-100 text-gray-800'
        }
      }

      return (
        <div className='flex w-[100px] items-center'>
          <Badge className={getStatusColor(status.value)}>{status.label}</Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'startAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Início' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('startAt'))
      return (
        <div className='text-sm'>
          {date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'endAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fim' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('endAt'))
      return (
        <div className='text-sm'>
          {date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'viewed',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Visualizações' />
    ),
    cell: ({ row }) => {
      const viewed = row.getValue('viewed') as boolean
      return (
        <div className='text-sm'>
          {viewed ? (
            <Badge className='bg-green-100 text-green-800'>Visualizado</Badge>
          ) : (
            <Badge variant='outline'>Não visualizado</Badge>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return (
        <div className='flex justify-end'>
          <StoriesActions story={row.original} />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
