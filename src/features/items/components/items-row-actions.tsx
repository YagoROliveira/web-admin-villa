import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import type { Row } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { Pencil, Trash2, Power, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Item } from '../data/schema'
import { useItemsContext } from './items-provider'
import {
  useToggleItemActive,
  useApproveItem,
} from '../hooks/use-items'

interface ItemsRowActionsProps {
  row: Row<Item>
}

export function ItemsRowActions({ row }: ItemsRowActionsProps) {
  const item = row.original
  const navigate = useNavigate()
  const { setOpen, setCurrentRow } = useItemsContext()
  const toggleActive = useToggleItemActive()
  const approveItem = useApproveItem()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[180px]'>
        <DropdownMenuItem
          onClick={() =>
            navigate({
              to: '/items/$itemId/edit',
              params: { itemId: item.id },
            })
          }
        >
          <Pencil className='mr-2 h-4 w-4' />
          Editar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => toggleActive.mutate(item.id)}
          disabled={toggleActive.isPending}
        >
          <Power className='mr-2 h-4 w-4' />
          {item.isActive ? 'Desativar' : 'Ativar'}
        </DropdownMenuItem>

        {!item.isApproved && (
          <DropdownMenuItem
            onClick={() => approveItem.mutate(item.id)}
            disabled={approveItem.isPending}
          >
            <CheckCircle className='mr-2 h-4 w-4' />
            Aprovar
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(item)
            setOpen('delete')
          }}
          className='!text-red-500'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Excluir
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
