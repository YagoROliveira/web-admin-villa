import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { StoriesProvider, StoriesTable } from '@/features/stories/components'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/stories/')({
  beforeLoad: requirePermission('wallet.stories.view'),
  component: StoriesPage,
})

function StoriesPage() {
  const navigate = useNavigate()

  return (
    <StoriesProvider>
      <Header>
        <Search />
        <div className='ml-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Stories</h1>
            <p className='text-sm text-muted-foreground'>
              Gerencie os stories exibidos no app
            </p>
          </div>
          <Button onClick={() => navigate({ to: '/stories/new' })}>
            <Plus className='mr-2 h-4 w-4' />
            Novo Story
          </Button>
        </div>

        <StoriesTable />
      </Main>

      <ConfigDrawer />
    </StoriesProvider>
  )
}
