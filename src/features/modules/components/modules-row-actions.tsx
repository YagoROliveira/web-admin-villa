import type { Row } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { MoreHorizontal, Pencil, Trash2, Power } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Module } from '../data/schema'
import { useModulesContext } from './modules-provider'
import { useToggleModuleActive } from '../hooks/use-modules'

interface Props {
  row: Row<Module>
}

export function ModulesRowActions({ row }: Props) {
  const navigate = useNavigate()
  const { setOpen, setCurrentRow } = useModulesContext()
  const toggleActive = useToggleModuleActive()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Ações</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem
          onClick={() =>
            navigate({ to: '/admin/modules/$moduleId/edit', params: { moduleId: row.original.id } })
          }
        >
          <Pencil className='mr-2 h-4 w-4' /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => toggleActive.mutate(row.original.id)}>
          <Power className='mr-2 h-4 w-4' />
          {row.original.isActive ? 'Desativar' : 'Ativar'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='text-destructive focus:text-destructive'
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('delete')
          }}
        >
          <Trash2 className='mr-2 h-4 w-4' /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
