'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Customer } from '../data/schema'
import { useDeleteCustomer } from '../hooks/use-customers'

type CustomerDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Customer | null
}

export function CustomersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: CustomerDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteCustomerMutation = useDeleteCustomer()

  const handleDelete = async () => {
    if (!currentRow || value.trim() !== currentRow.name) return

    try {
      await deleteCustomerMutation.mutateAsync(currentRow.id)
      onOpenChange(false)
      setValue('')
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
    }
  }

  const isLoading = deleteCustomerMutation.isPending

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!isLoading) {
          onOpenChange(state)
          setValue('')
        }
      }}
      handleConfirm={handleDelete}
      disabled={!currentRow || value.trim() !== currentRow.name || isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Deletar Cliente
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Tem certeza que deseja deletar{' '}
            <span className='font-bold'>{currentRow?.name}</span>?
            <br />
            Esta ação removerá permanentemente o cliente do sistema.
            Esta ação não pode ser desfeita.
          </p>

          <Label className='my-2'>
            Nome do cliente (digite para confirmar):
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Digite o nome do cliente para confirmar'
              disabled={isLoading}
            />
          </Label>
        </div>
      }
      confirmText={isLoading ? 'Deletando...' : 'Deletar'}
      destructive
    />
  )
}
