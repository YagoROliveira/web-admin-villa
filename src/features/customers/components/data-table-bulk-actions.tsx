import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, UserX, UserCheck, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Customer } from '../data/schema'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedCustomers = selectedRows.map((row) => row.original as Customer)
    toast.promise(sleep(2000), {
      loading: `${status === 'active' ? 'Ativando' : 'Desativando'} clientes...`,
      success: () => {
        table.resetRowSelection()
        return `${status === 'active' ? 'Ativados' : 'Desativados'} ${selectedCustomers.length} cliente${selectedCustomers.length > 1 ? 's' : ''}`
      },
      error: `Erro ao ${status === 'active' ? 'ativar' : 'desativar'} clientes`,
    })
    table.resetRowSelection()
  }

  const handleBulkEmail = () => {
    const selectedCustomers = selectedRows.map((row) => row.original as Customer)
    toast.promise(sleep(2000), {
      loading: 'Enviando email...',
      success: () => {
        table.resetRowSelection()
        return `Email enviado para ${selectedCustomers.length} cliente${selectedCustomers.length > 1 ? 's' : ''}`
      },
      error: 'Erro ao enviar email',
    })
    table.resetRowSelection()
  }

  return (
    <BulkActionsToolbar table={table} entityName='cliente'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleBulkStatusChange('active')}
          >
            <UserCheck className='mr-1 h-4 w-4' />
            Ativar
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ativar selecionados</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleBulkStatusChange('inactive')}
          >
            <UserX className='mr-1 h-4 w-4' />
            Desativar
          </Button>
        </TooltipTrigger>
        <TooltipContent>Desativar selecionados</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='outline' size='sm' onClick={handleBulkEmail}>
            <Mail className='mr-1 h-4 w-4' />
            Enviar Email
          </Button>
        </TooltipTrigger>
        <TooltipContent>Enviar email para selecionados</TooltipContent>
      </Tooltip>
    </BulkActionsToolbar>
  )
}
