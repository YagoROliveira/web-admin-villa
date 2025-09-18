import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { StoryForm, StoriesProvider } from '@/features/stories/components'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { type Story } from '@/features/stories/data/schema'

export const Route = createFileRoute('/_authenticated/stories/$storyId/edit')({
  component: EditStoryPage,
})

function EditStoryPage() {
  const navigate = useNavigate()
  const { storyId } = Route.useParams()
  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Buscar dados do story pela API
    const fetchStory = async () => {
      try {
        setIsLoading(true)
        // Simular dados do story
        const mockStory: Story = {
          id: storyId,
          name: 'Story Exemplo',
          status: 'ACTIVE',
          viewed: false,
          module: 'Module 1',
          storeId: '1',
          userId: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          startAt: new Date().toISOString(),
          endAt: new Date().toISOString(),
          images: [],
        }
        setStory(mockStory)
      } catch (error) {
        console.error('Erro ao buscar story:', error)
        toast.error('Erro ao carregar story')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStory()
  }, [storyId])

  const handleBack = () => {
    navigate({ to: '/stories' })
  }

  const handleSave = async (data: any) => {
    try {
      // TODO: Implementar API call para atualizar story
      console.log('Atualizando story:', storyId, data)

      // Simular sucesso
      toast.success('Story atualizado com sucesso!')

      // Navegar de volta para a lista
      navigate({ to: '/stories' })
    } catch (error) {
      console.error('Erro ao atualizar story:', error)
      toast.error('Erro ao atualizar story')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          Carregando story...
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          Story não encontrado
        </div>
      </div>
    )
  }

  return (
    <StoriesProvider>
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Story</h1>
            <p className="text-muted-foreground">
              Edite as informações do story "{story.name}"
            </p>
          </div>
        </div>

        <StoryForm story={story} onSave={handleSave} onCancel={handleBack} />
      </div>
    </StoriesProvider>
  )
}
