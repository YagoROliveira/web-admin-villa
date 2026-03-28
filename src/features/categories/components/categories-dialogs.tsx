import { ConfirmDialog } from '@/components/confirm-dialog'
import { useCategoriesContext } from './categories-provider'
import { useDeleteCategory } from '../hooks/use-categories'

export function CategoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCategoriesContext()
  const deleteCategory = useDeleteCategory()

  return (
    <>
      {currentRow && (
        <ConfirmDialog
          key='category-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => setCurrentRow(null), 500)
          }}
          handleConfirm={() => {
            deleteCategory.mutate(currentRow.id)
            setOpen(null)
            setTimeout(() => setCurrentRow(null), 500)
          }}
          className='max-w-md'
          title={`Excluir categoria "${currentRow.name}"?`}
          desc={
            <>
              Tem certeza que deseja excluir a categoria{' '}
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
