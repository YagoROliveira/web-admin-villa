import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StoriesProvider, StoriesTable } from '@/features/stories/components'

export const Route = createFileRoute('/_authenticated/stories/')({
  component: StoriesPage,
})

function StoriesPage() {
  const navigate = useNavigate()

  const handleNewStory = () => {
    navigate({ to: '/stories/new' })
  }

  return (
    <StoriesProvider>
      <div className='container mx-auto py-6'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Stories</h1>
            <p className='text-muted-foreground'>
              Gerencie os stories que serão exibidos no app
            </p>
          </div>
          <Button onClick={handleNewStory}>
            <Plus className='mr-2 h-4 w-4' />
            Novo Story
          </Button>
        </div>

        <StoriesTable />
      </div>
    </StoriesProvider>
  )
}
