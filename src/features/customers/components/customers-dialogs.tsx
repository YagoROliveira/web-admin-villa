import { CustomersActionDialog } from './customers-action-dialog'
import { CustomersDeleteDialog } from './customers-delete-dialog'
import { useCustomersContext } from './customers-provider'

export function CustomersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCustomersContext()

  const handleClose = () => {
    setOpen(null)
    if (currentRow) {
      setTimeout(() => {
        setCurrentRow(null)
      }, 300)
    }
  }

  return (
    <>
      <CustomersActionDialog
        key={`customer-edit-${currentRow?.id || 'none'}`}
        open={open === 'edit'}
        onOpenChange={(isOpen) => !isOpen && handleClose()}
        currentRow={currentRow}
      />

      <CustomersDeleteDialog
        key={`customer-delete-${currentRow?.id || 'none'}`}
        open={open === 'delete'}
        onOpenChange={(isOpen) => !isOpen && handleClose()}
        currentRow={currentRow}
      />
    </>
  )
}
