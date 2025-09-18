import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { StoriesProvider, StoriesTable } from '@/features/stories/components'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

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
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Stories</h1>
            <p className="text-muted-foreground">
              Gerencie os stories que serão exibidos no app
            </p>
          </div>
          <Button onClick={handleNewStory}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Story
          </Button>
        </div>

        <StoriesTable />
      </div>
    </StoriesProvider>
  )
}
