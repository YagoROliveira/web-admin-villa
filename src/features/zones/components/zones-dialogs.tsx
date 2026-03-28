import { ConfirmDialog } from '@/components/confirm-dialog'
import { useZonesContext } from './zones-provider'
import { useDeleteZone } from '../hooks/use-zones'

export function ZonesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useZonesContext()
  const deleteZone = useDeleteZone()

  return (
    <>
      {currentRow && (
        <ConfirmDialog
          open={open === 'delete'}
          onOpenChange={(v) => {
            setOpen(v ? 'delete' : null)
            if (!v) setTimeout(() => setCurrentRow(null), 300)
          }}
          title={`Excluir zona "${currentRow.name}"?`}
          desc='Essa ação não pode ser desfeita. Todas as associações com módulos, lojas e entregadores serão afetadas.'
          confirmText='Excluir'
          destructive
          isLoading={deleteZone.isPending}
          handleConfirm={() =>
            deleteZone.mutate(currentRow.id, {
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
