import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Edit, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { type Story } from '@/features/stories/data/schema'

export const Route = createFileRoute('/_authenticated/stories/$storyId/')({
  component: StoryDetailsPage,
})

function StoryDetailsPage() {
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
          name: 'Story Exemplo - Promoção de Verão',
          status: 'ACTIVE',
          viewed: true,
          module: 'Promoções',
          storeId: '1',
          userId: '1',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:45:00Z',
          startAt: '2024-01-15T00:00:00Z',
          endAt: '2024-02-15T23:59:59Z',
          images: [
            {
              id: '1',
              url: 'https://via.placeholder.com/400x600/ff6b6b/ffffff?text=Story+1',
              order: 1,
            },
            {
              id: '2',
              url: 'https://via.placeholder.com/400x600/4ecdc4/ffffff?text=Story+2',
              order: 2,
            },
          ],
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

  const handleEdit = () => {
    navigate({ to: `/stories/${storyId}/edit` })
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este story?')) {
      try {
        // TODO: Implementar API call para excluir story
        console.log('Excluindo story:', storyId)
        toast.success('Story excluído com sucesso!')
        navigate({ to: '/stories' })
      } catch (error) {
        console.error('Erro ao excluir story:', error)
        toast.error('Erro ao excluir story')
      }
    }
  }

  const getStatusBadge = (status: Story['status']) => {
    const statusConfig = {
      ACTIVE: { label: 'Ativo', variant: 'default' as const },
      INACTIVE: { label: 'Inativo', variant: 'secondary' as const },
      SCHEDULED: { label: 'Agendado', variant: 'outline' as const },
      PAUSED: { label: 'Pausado', variant: 'destructive' as const },
      CONCLUDED: { label: 'Concluído', variant: 'secondary' as const },
    }

    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='text-center'>Carregando story...</div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className='container mx-auto py-6'>
        <div className='text-center'>Story não encontrado</div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-6'>
      {/* Header */}
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' onClick={handleBack}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>{story.name}</h1>
            <p className='text-muted-foreground'>Detalhes do story</p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={handleEdit}>
            <Edit className='mr-2 h-4 w-4' />
            Editar
          </Button>
          <Button variant='destructive' onClick={handleDelete}>
            <Trash2 className='mr-2 h-4 w-4' />
            Excluir
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Informações Principais */}
        <div className='space-y-6 lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Nome
                  </label>
                  <p className='text-sm'>{story.name}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Status
                  </label>
                  <div className='mt-1'>{getStatusBadge(story.status)}</div>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Módulo
                  </label>
                  <p className='text-sm'>{story.module}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Visualizado
                  </label>
                  <div className='mt-1 flex items-center gap-2'>
                    <Eye className='h-4 w-4' />
                    <span className='text-sm'>
                      {story.viewed ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Período de Exibição</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Data de Início
                  </label>
                  <p className='text-sm'>
                    {format(new Date(story.startAt), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Data de Fim
                  </label>
                  <p className='text-sm'>
                    {format(new Date(story.endAt), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    ID
                  </label>
                  <p className='font-mono text-sm'>{story.id}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Store ID
                  </label>
                  <p className='font-mono text-sm'>{story.storeId}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    User ID
                  </label>
                  <p className='font-mono text-sm'>{story.userId}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Criado em
                  </label>
                  <p className='text-sm'>
                    {format(new Date(story.createdAt), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Imagens */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>
                Imagens do Story ({story.images?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {story.images && story.images.length > 0 ? (
                <div className='space-y-4'>
                  {story.images.map((image, index) => (
                    <div key={image.id} className='space-y-2'>
                      <div className='text-sm font-medium'>
                        Imagem {index + 1}
                      </div>
                      <img
                        src={image.url}
                        alt={`Story imagem ${index + 1}`}
                        className='h-48 w-full rounded-lg border object-cover'
                      />
                      {image.order && (
                        <div className='text-muted-foreground text-xs'>
                          Ordem: {image.order}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-muted-foreground py-8 text-center'>
                  Nenhuma imagem disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
