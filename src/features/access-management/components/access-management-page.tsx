import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { RefreshCw, UserPlus, Shield, Search as SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { usePanelUsers } from '../hooks/use-panel-users'
import { UsersRoleTable } from './users-role-table'
import { InviteUserDialog } from './invite-user-dialog'

export function AccessManagement() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = usePanelUsers(page)

  // Client-side search filter (API search can be added later)
  const filteredUsers = (usersData?.users || []).filter((user) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      user.firstName.toLowerCase().includes(q) ||
      user.lastName.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (typeof user.role === 'string' ? user.role : (user.role as any)?.name ?? '').toLowerCase().includes(q)
    )
  })

  if (error) {
    return (
      <>
        <Header fixed>
          <Search />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ProfileDropdown />
          </div>
        </Header>
        <Main>
          <div className='flex min-h-[400px] flex-col items-center justify-center space-y-4'>
            <Shield className='h-12 w-12 text-muted-foreground' />
            <p className='text-destructive'>
              Erro ao carregar gestão de acessos: {error.message}
            </p>
            <Button onClick={() => refetch()} variant='outline'>
              <RefreshCw className='mr-2 h-4 w-4' />
              Tentar novamente
            </Button>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Gestão de Acessos
            </h2>
            <p className='text-muted-foreground'>
              Gerencie os papéis e permissões dos usuários do painel.
              {usersData?.pagination?.total != null &&
                ` (${usersData.pagination.total} usuários)`}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              onClick={() => refetch()}
              variant='outline'
              size='sm'
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
              />
              Atualizar
            </Button>
            <Button onClick={() => setInviteOpen(true)} size='sm'>
              <UserPlus className='mr-2 h-4 w-4' />
              Convidar Usuário
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className='mb-4 flex items-center space-x-2'>
          <div className='relative max-w-sm flex-1'>
            <SearchIcon className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              placeholder='Buscar por nome, e-mail ou papel...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9'
            />
          </div>
        </div>

        {/* Users Table */}
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1'>
          <UsersRoleTable
            users={filteredUsers}
            isLoading={isLoading}
            onEditRole={(user) =>
              navigate({
                to: '/admin/access-management/$userId/edit',
                params: { userId: user.id },
              })
            }
          />
        </div>
      </Main>

      {/* Invite Dialog */}
      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  )
}
