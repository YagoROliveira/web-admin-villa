import { ConfirmDialog } from '@/components/confirm-dialog'
import { useStoresContext } from './stores-provider'
import { useDeleteStore } from '../hooks/use-stores'

export function StoresDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStoresContext()
  const deleteStore = useDeleteStore()

  return (
    <>
      {/* Delete confirmation only — create/edit are now full pages */}
      {currentRow && (
        <ConfirmDialog
          key='store-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => setCurrentRow(null), 500)
          }}
          handleConfirm={() => {
            deleteStore.mutate(currentRow.id)
            setOpen(null)
            setTimeout(() => setCurrentRow(null), 500)
          }}
          className='max-w-md'
          title={`Excluir loja "${currentRow.name}"?`}
          desc={
            <>
              Tem certeza que deseja excluir a loja{' '}
              <strong>{currentRow.name}</strong>? Esta ação não pode ser
              desfeita.
            </>
          }
          confirmText='Excluir'
        />
      )}
    </>
  )
}
