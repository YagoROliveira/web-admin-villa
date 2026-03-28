import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import type { Row } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { Pencil, Trash2, Power, CheckCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Store } from '../data/schema'
import { useStoresContext } from './stores-provider'
import {
  useToggleStoreActive,
  useToggleStoreApproved,
  useToggleStoreFeatured,
} from '../hooks/use-stores'

interface StoresRowActionsProps {
  row: Row<Store>
}

export function StoresRowActions({ row }: StoresRowActionsProps) {
  const store = row.original
  const navigate = useNavigate()
  const { setOpen, setCurrentRow } = useStoresContext()
  const toggleActive = useToggleStoreActive()
  const toggleApproved = useToggleStoreApproved()
  const toggleFeatured = useToggleStoreFeatured()

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
              to: '/admin/stores/$storeId/edit',
              params: { storeId: store.id },
            })
          }
        >
          <Pencil className='mr-2 h-4 w-4' />
          Editar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => toggleActive.mutate(store.id)}
          disabled={toggleActive.isPending}
        >
          <Power className='mr-2 h-4 w-4' />
          {store.isActive ? 'Desativar' : 'Ativar'}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => toggleApproved.mutate(store.id)}
          disabled={toggleApproved.isPending}
        >
          <CheckCircle className='mr-2 h-4 w-4' />
          {store.isApproved ? 'Desaprovar' : 'Aprovar'}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => toggleFeatured.mutate(store.id)}
          disabled={toggleFeatured.isPending}
        >
          <Star className='mr-2 h-4 w-4' />
          {store.isFeatured ? 'Remover destaque' : 'Destacar'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(store)
            setOpen('delete')
          }}
          className='text-destructive focus:text-destructive'
        >
          Excluir
          <DropdownMenuShortcut>
            <Trash2 size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
