import { Shield, MoreHorizontal, UserX, Edit } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ROLE_LABELS } from '@/types/auth'
import type { UserRole } from '@/types/auth'
import type { PanelUser } from '../data/schema'
import { useRevokeAccess } from '../hooks/use-panel-users'
import { useAuthStore } from '@/stores/auth-store'

interface UsersRoleTableProps {
  users: PanelUser[]
  isLoading: boolean
  onEditRole: (user: PanelUser) => void
}

/** Safely extract role name string from a value that may be an object */
function safeRoleStr(role: unknown): string {
  if (typeof role === 'string') return role
  if (typeof role === 'object' && role !== null && 'name' in role) return String((role as any).name)
  return String(role ?? '')
}

function getRoleBadgeVariant(role: unknown) {
  const r = safeRoleStr(role)
  switch (r) {
    case 'SUPER_ADMIN':
    case 'super_admin':
      return 'destructive' as const
    case 'ADMIN':
    case 'admin':
      return 'default' as const
    case 'VENDOR':
    case 'vendor':
      return 'secondary' as const
    case 'VENDOR_EMPLOYEE':
    case 'vendor_employee':
      return 'outline' as const
    default:
      return 'outline' as const
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant='default' className='bg-green-600'>
          Ativo
        </Badge>
      )
    case 'INACTIVE':
      return <Badge variant='secondary'>Inativo</Badge>
    case 'SUSPENDED':
      return <Badge variant='destructive'>Suspenso</Badge>
    case 'PENDING_VERIFICATION':
      return (
        <Badge variant='outline' className='text-yellow-600'>
          Pendente
        </Badge>
      )
    default:
      return <Badge variant='outline'>{status}</Badge>
  }
}

export function UsersRoleTable({
  users,
  isLoading,
  onEditRole,
}: UsersRoleTableProps) {
  const revokeAccess = useRevokeAccess()
  const currentUser = useAuthStore((s) => s.auth.user)
  const isSuperAdmin = safeRoleStr(currentUser?.role) === 'SUPER_ADMIN' || safeRoleStr(currentUser?.role) === 'super_admin'

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center space-x-4'>
            <Skeleton className='h-10 w-10 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-48' />
              <Skeleton className='h-3 w-32' />
            </div>
            <Skeleton className='h-6 w-20' />
          </div>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className='flex min-h-[300px] flex-col items-center justify-center space-y-2'>
        <Shield className='h-10 w-10 text-muted-foreground' />
        <p className='text-muted-foreground'>Nenhum usuário encontrado</p>
      </div>
    )
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Permissões</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Loja</TableHead>
            <TableHead className='w-[70px]'>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
            const isCurrentUser = currentUser?.id === user.id
            const roleStr = safeRoleStr(user.role)
            const canEdit = isSuperAdmin || (!isCurrentUser && roleStr !== 'SUPER_ADMIN' && roleStr !== 'super_admin')

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className='flex items-center space-x-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage
                        src={user.avatar || undefined}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback>{initials || 'VM'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium leading-none'>
                        {user.firstName} {user.lastName}
                        {isCurrentUser && (
                          <span className='ml-1 text-xs text-muted-foreground'>
                            (você)
                          </span>
                        )}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {ROLE_LABELS[safeRoleStr(user.role) as UserRole] ?? safeRoleStr(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className='text-sm text-muted-foreground'>
                    {user.permissions?.length ?? 0} permissões
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  <span className='text-sm text-muted-foreground'>
                    {user.storeName ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  {canEdit && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => onEditRole(user)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Editar Papel & Permissões
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-destructive'
                          onClick={() => {
                            if (
                              window.confirm(
                                `Revogar acesso de ${user.firstName} ${user.lastName}?`
                              )
                            ) {
                              revokeAccess.mutate(user.id)
                            }
                          }}
                        >
                          <UserX className='mr-2 h-4 w-4' />
                          Revogar Acesso
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
