import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { type Story } from '../data/schema'
import { StoriesRowActions } from './stories-row-actions'

interface StoriesActionsProps {
  story: Story
}

export function StoriesActions({ story }: StoriesActionsProps) {
  const navigate = useNavigate()

  const handleEdit = () => {
    navigate({ to: `/stories/${story.id}/edit` })
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este story?')) {
      try {
        // TODO: Implementar API call para excluir story
        console.log('Excluindo story:', story.id)
        toast.success('Story excluído com sucesso!')
        // Recarregar a página ou atualizar lista
        window.location.reload()
      } catch (error) {
        console.error('Erro ao excluir story:', error)
        toast.error('Erro ao excluir story')
      }
    }
  }

  const handleDuplicate = async () => {
    try {
      // TODO: Implementar API call para duplicar story
      console.log('Duplicando story:', story.id)
      toast.success('Story duplicado com sucesso!')
      // Recarregar a página ou atualizar lista
      window.location.reload()
    } catch (error) {
      console.error('Erro ao duplicar story:', error)
      toast.error('Erro ao duplicar story')
    }
  }

  return (
    <StoriesRowActions
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
    />
  )
}
