'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'
import { useDeleteUser } from '../hooks/use-users'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User | null
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteUserMutation = useDeleteUser()

  const handleDelete = async () => {
    if (!currentRow || value.trim() !== currentRow.email) return

    try {
      await deleteUserMutation.mutateAsync(currentRow.id)
      onOpenChange(false)
      setValue('')
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
    }
  }

  const isLoading = deleteUserMutation.isPending
  const userDisplayName = currentRow
    ? `${currentRow.firstName} ${currentRow.lastName}`
    : ''

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
      disabled={!currentRow || value.trim() !== currentRow.email || isLoading}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='stroke-destructive me-1 inline-block'
            size={18}
          />{' '}
          Deletar Usuário
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Tem certeza que deseja deletar{' '}
            <span className='font-bold'>{userDisplayName}</span>?
            <br />
            Esta ação removerá permanentemente o usuário com o papel de{' '}
            <span className='font-bold'>{currentRow?.role}</span> do sistema.
            Esta ação não pode ser desfeita.
          </p>

          <Label className='my-2'>
            Email (digite para confirmar):
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Digite o email para confirmar a exclusão'
              disabled={isLoading}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Atenção!</AlertTitle>
            <AlertDescription>
              Tenha cuidado, esta operação não pode ser desfeita.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={isLoading ? 'Deletando...' : 'Deletar'}
      destructive
    />
  )
}
