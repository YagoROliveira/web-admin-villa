import { UsersActionDialog } from './users-action-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()

  const handleClose = (dialogType: string) => {
    setOpen(null)
    if (currentRow) {
      setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    }
  }

  return (
    <>
      <UsersActionDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={(isOpen) => !isOpen && handleClose('add')}
      />

      <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={(isOpen) => !isOpen && handleClose('invite')}
      />

      <UsersActionDialog
        key={`user-edit-${currentRow?.id || 'none'}`}
        open={open === 'edit'}
        onOpenChange={(isOpen) => !isOpen && handleClose('edit')}
        currentRow={currentRow}
      />

      <UsersDeleteDialog
        key={`user-delete-${currentRow?.id || 'none'}`}
        open={open === 'delete'}
        onOpenChange={(isOpen) => !isOpen && handleClose('delete')}
        currentRow={currentRow}
      />
    </>
  )
}
