import type { Row } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Category } from '../data/schema'
import { useCategoriesContext } from './categories-provider'

interface CategoriesRowActionsProps {
  row: Row<Category>
}

export function CategoriesRowActions({ row }: CategoriesRowActionsProps) {
  const navigate = useNavigate()
  const { setOpen, setCurrentRow } = useCategoriesContext()

  const handleEdit = () => {
    navigate({ to: '/admin/categories/$categoryId/edit', params: { categoryId: row.original.id } })
  }

  const handleDelete = () => {
    setCurrentRow(row.original)
    setOpen('delete')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <span className='sr-only'>Abrir menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className='mr-2 h-4 w-4' />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className='text-destructive focus:text-destructive'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
