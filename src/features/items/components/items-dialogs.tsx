import { ConfirmDialog } from '@/components/confirm-dialog'
import { useItemsContext } from './items-provider'
import { useDeleteItem } from '../hooks/use-items'
import { ItemsImportDialog } from './items-import-dialog'
import { ItemsStockDialog } from './items-stock-dialog'

export function ItemsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useItemsContext()
  const deleteItem = useDeleteItem()

  return (
    <>
      {/* Delete confirmation */}
      {currentRow && (
        <ConfirmDialog
          key='item-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => setCurrentRow(null), 500)
          }}
          handleConfirm={() => {
            deleteItem.mutate(currentRow.id)
            setOpen(null)
            setTimeout(() => setCurrentRow(null), 500)
          }}
          className='max-w-md'
          title={`Excluir produto "${currentRow.name}"?`}
          desc={
            <>
              Tem certeza que deseja excluir o produto{' '}
              <strong>{currentRow.name}</strong>? Esta ação não pode ser
              desfeita.
            </>
          }
          confirmText='Excluir'
        />
      )}

      {/* Import dialog */}
      <ItemsImportDialog />

      {/* Stock management dialog */}
      <ItemsStockDialog />
    </>
  )
}

