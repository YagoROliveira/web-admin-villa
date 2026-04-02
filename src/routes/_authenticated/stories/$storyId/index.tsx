import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, ImageOff } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type Story } from '@/features/stories/data/schema'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
  INACTIVE: { label: 'Inativo', className: 'bg-gray-100 text-gray-800' },
  SCHEDULED: { label: 'Agendado', className: 'bg-blue-100 text-blue-800' },
  PAUSED: { label: 'Pausado', className: 'bg-yellow-100 text-yellow-800' },
  CONCLUDED: { label: 'Concluído', className: 'bg-purple-100 text-purple-800' },
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='flex items-start justify-between gap-4 py-2.5'>
      <span className='shrink-0 text-sm text-muted-foreground'>{label}</span>
      <span className='text-right text-sm font-medium'>{value ?? '—'}</span>
    </div>
  )
}

function StoryImage({ url, alt, index }: { url: string; alt: string; index: number }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className='relative w-32 flex-shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm'>
      <div className='relative aspect-[9/16]'>
        {!failed ? (
          <img
            src={url}
            alt={alt}
            className='absolute inset-0 h-full w-full object-cover'
            onError={() => setFailed(true)}
          />
        ) : (
          <div className='absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
            <ImageOff className='size-7 opacity-50' />
            <span className='text-xs'>Imagem {index + 1}</span>
          </div>
        )}
        <div className='absolute bottom-0 left-0 right-0 bg-black/50 py-1 text-center text-xs text-white'>
          {index + 1}
        </div>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/stories/$storyId/')({
  component: StoryDetailsPage,
})

function StoryDetailsPage() {
  const navigate = useNavigate()
  const { storyId } = Route.useParams()
  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const fetchStory = async () => {
      try {
        setIsLoading(true)
        // TODO: substituir pelo fetch real da API
        const mockStory: Story = {
          id: storyId,
          name: 'Promoção de Verão',
          status: 'ACTIVE',
          viewed: true,
          module: 'Promoções',
          storeId: '1',
          userId: '1',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:45:00Z',
          startAt: '2024-01-15T00:00:00Z',
          endAt: '2024-02-15T23:59:59Z',
          images: [],
        }
        setStory(mockStory)
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        console.error('Erro ao buscar story:', error)
        toast.error('Erro ao carregar story')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStory()
    return () => controller.abort()
  }, [storyId])

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este story?')) {
      try {
        toast.success('Story excluído com sucesso!')
        navigate({ to: '/stories' })
      } catch (error) {
        console.error('Erro ao excluir story:', error)
        toast.error('Erro ao excluir story')
      }
    }
  }

  const fmt = (d: string) =>
    format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: ptBR })

  const pageHeader = (
    <Header>
      <Search />
      <div className='ml-auto flex items-center gap-4'>
        <ThemeSwitch />
        <ProfileDropdown />
      </div>
    </Header>
  )

  if (isLoading) {
    return (
      <>
        {pageHeader}
        <Main>
          <div className='flex h-48 items-center justify-center text-muted-foreground'>
            Carregando story...
          </div>
        </Main>
        <ConfigDrawer />
      </>
    )
  }

  if (!story) {
    return (
      <>
        {pageHeader}
        <Main>
          <div className='flex h-48 items-center justify-center text-muted-foreground'>
            Story não encontrado.
          </div>
        </Main>
        <ConfigDrawer />
      </>
    )
  }

  const statusCfg = STATUS_CONFIG[story.status] ?? { label: story.status, className: '' }

  return (
    <>
      {pageHeader}
      <Main>
        {/* Topo */}
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' onClick={() => navigate({ to: '/stories' })}>
              <ArrowLeft className='mr-1 h-4 w-4' /> Voltar
            </Button>
            <Separator orientation='vertical' className='h-6' />
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>{story.name}</h1>
              <p className='text-sm text-muted-foreground'>Detalhes do story</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={() => navigate({ to: `/stories/${storyId}/edit` })}>
              <Edit className='mr-1 h-4 w-4' /> Editar
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              <Trash2 className='mr-1 h-4 w-4' /> Excluir
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          {/* Infos */}
          <div className='space-y-6 lg:col-span-2'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className='divide-y'>
                <InfoRow label='Nome' value={story.name} />
                <InfoRow
                  label='Status'
                  value={
                    <Badge className={statusCfg.className}>{statusCfg.label}</Badge>
                  }
                />
                <InfoRow label='Módulo' value={story.module} />
                <InfoRow
                  label='Visualizado'
                  value={
                    story.viewed ? (
                      <span className='flex items-center gap-1 text-green-600'>
                        <Eye className='size-3.5' /> Sim
                      </span>
                    ) : (
                      <span className='flex items-center gap-1 text-muted-foreground'>
                        <EyeOff className='size-3.5' /> Não
                      </span>
                    )
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Período de Exibição</CardTitle>
              </CardHeader>
              <CardContent className='divide-y'>
                <InfoRow label='Início' value={fmt(story.startAt)} />
                <InfoRow label='Fim' value={fmt(story.endAt)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>Informações do Sistema</CardTitle>
              </CardHeader>
              <CardContent className='divide-y'>
                <InfoRow label='ID' value={<span className='font-mono text-xs'>{story.id}</span>} />
                <InfoRow label='Store ID' value={<span className='font-mono text-xs'>{story.storeId}</span>} />
                <InfoRow label='User ID' value={<span className='font-mono text-xs'>{story.userId}</span>} />
                <InfoRow label='Criado em' value={fmt(story.createdAt)} />
                <InfoRow label='Atualizado em' value={fmt(story.updatedAt)} />
              </CardContent>
            </Card>
          </div>

          {/* Imagens */}
          <div>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base'>
                  Imagens{' '}
                  <span className='ml-1 text-sm font-normal text-muted-foreground'>
                    ({story.images?.length ?? 0})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {story.images && story.images.length > 0 ? (
                  <div className='flex flex-wrap gap-3'>
                    {story.images.map((image, index) => (
                      <StoryImage
                        key={image.id}
                        url={image.url}
                        alt={`Imagem ${index + 1} — ${story.name}`}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground'>
                    <ImageOff className='size-10 opacity-40' />
                    <p className='text-sm'>Nenhuma imagem cadastrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Main>
      <ConfigDrawer />
    </>
  )
}
