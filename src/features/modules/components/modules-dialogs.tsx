import { ConfirmDialog } from '@/components/confirm-dialog'
import { useModulesContext } from './modules-provider'
import { useDeleteModule } from '../hooks/use-modules'

export function ModulesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useModulesContext()
  const deleteModule = useDeleteModule()

  return (
    <>
      {currentRow && (
        <ConfirmDialog
          open={open === 'delete'}
          onOpenChange={(v) => {
            setOpen(v ? 'delete' : null)
            if (!v) setTimeout(() => setCurrentRow(null), 300)
          }}
          title={`Excluir módulo "${currentRow.name}"?`}
          desc='Essa ação não pode ser desfeita. Todas as associações com zonas serão removidas.'
          confirmText='Excluir'
          destructive
          isLoading={deleteModule.isPending}
          handleConfirm={() =>
            deleteModule.mutate(currentRow.id, {
              onSuccess: () => {
                setOpen(null)
                setTimeout(() => setCurrentRow(null), 300)
              },
            })
          }
        />
      )}
    </>
  )
}
