import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StoryForm, StoriesProvider } from '@/features/stories/components'

export const Route = createFileRoute('/_authenticated/stories/new')({
  component: NewStoryPage,
})

function NewStoryPage() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate({ to: '/stories' })
  }

  const handleSave = async (data: any) => {
    try {
      // TODO: Implementar API call para criar story
      console.log('Dados do story:', data)

      // Simular sucesso
      toast.success('Story criado com sucesso!')

      // Navegar de volta para a lista
      navigate({ to: '/stories' })
    } catch (error) {
      console.error('Erro ao criar story:', error)
      toast.error('Erro ao criar story')
    }
  }

  return (
    <StoriesProvider>
      <div className='container mx-auto py-6'>
        <div className='mb-6 flex items-center gap-4'>
          <Button variant='ghost' size='sm' onClick={handleBack}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Novo Story</h1>
            <p className='text-muted-foreground'>
              Crie um novo story para ser exibido no app
            </p>
          </div>
        </div>

        <StoryForm onSave={handleSave} onCancel={handleBack} />
      </div>
    </StoriesProvider>
  )
}
