import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Check,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import {
  USER_ROLES,
  PERMISSIONS,
  ROLE_LABELS,
  DEFAULT_ROLE_PERMISSIONS,
} from '@/types/auth'
import type { UserRole, Permission } from '@/types/auth'
import { usePanelUsers, useUpdateUserRole } from '../hooks/use-panel-users'

// ─── Permission grouping ───

const PERMISSION_GROUP_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  admin: { label: 'Administração', icon: <ShieldAlert className='h-4 w-4' /> },
  orders: { label: 'Pedidos', icon: null },
  items: { label: 'Itens & Categorias', icon: null },
  categories: { label: 'Categorias', icon: null },
  reviews: { label: 'Avaliações', icon: null },
  chat: { label: 'Chat', icon: null },
  pos: { label: 'PDV', icon: null },
  notifications: { label: 'Notificações', icon: null },
  vendor: { label: 'Loja / Vendor', icon: <User className='h-4 w-4' /> },
  wallet: { label: 'Wallet / Financeiro', icon: <Shield className='h-4 w-4' /> },
}

function groupPermissions(perms: readonly string[]) {
  const groups: Record<string, string[]> = {}
  for (const p of perms) {
    const prefix = p.split('.')[0] ?? 'other'
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(p)
  }
  return groups
}

/** Merge small groups (orders, items, categories, reviews, chat, pos, notifications) into "shared" */
function mergeSmallGroups(groups: Record<string, string[]>) {
  const merged: Record<string, string[]> = {}
  const sharedKeys = ['orders', 'items', 'categories', 'reviews', 'chat', 'pos', 'notifications']
  const sharedPerms: string[] = []

  for (const [key, perms] of Object.entries(groups)) {
    if (sharedKeys.includes(key)) {
      sharedPerms.push(...perms)
    } else {
      merged[key] = perms
    }
  }

  if (sharedPerms.length > 0) {
    merged['shared'] = sharedPerms
  }

  return merged
}

const MERGED_GROUP_LABELS: Record<string, { label: string; description: string }> = {
  admin: {
    label: 'Administração',
    description: 'Gestão de lojas, clientes, entregadores, zonas, promoções, finanças e configurações do sistema.',
  },
  shared: {
    label: 'Funcionalidades Compartilhadas',
    description: 'Pedidos, itens, categorias, avaliações, chat, PDV e notificações.',
  },
  vendor: {
    label: 'Loja / Vendor',
    description: 'Gestão da loja, funcionários, entregadores, assinatura e finanças da loja.',
  },
  wallet: {
    label: 'Wallet / Financeiro',
    description: 'Dashboard, taxas, empréstimos, contas a pagar, cashback, stories, classificados e apps.',
  },
}

function formatPermLabel(perm: string): string {
  // "admin.stores.view" → "Stores View"
  const parts = perm.split('.')
  // Remove the group prefix
  const meaningful = parts.slice(1)
  return meaningful
    .map((p) => p.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(' · ')
}

// ─── Component ───

interface EditRolePageProps {
  userId: string
}

export function EditRolePage({ userId }: EditRolePageProps) {
  const navigate = useNavigate()
  const updateRole = useUpdateUserRole()
  const { data: usersData, isLoading: isLoadingUsers } = usePanelUsers(1, 100)

  const user = useMemo(
    () => usersData?.users?.find((u) => u.id === userId) ?? null,
    [usersData, userId]
  )

  const [selectedRole, setSelectedRole] = useState<UserRole>('VENDOR_EMPLOYEE')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [useDefaults, setUseDefaults] = useState(true)

  // Sync state when user loads
  useEffect(() => {
    if (user) {
      const role = (user.role as UserRole) || 'VENDOR_EMPLOYEE'
      setSelectedRole(role)
      const currentPerms = user.permissions || []
      const defaults = DEFAULT_ROLE_PERMISSIONS[role] || []
      const isDefault =
        currentPerms.length === defaults.length &&
        currentPerms.every((p) => defaults.includes(p as Permission))
      setUseDefaults(isDefault || currentPerms.length === 0)
      setSelectedPermissions(new Set(isDefault || currentPerms.length === 0 ? defaults : currentPerms))
    }
  }, [user])

  // When role changes and useDefaults is on, reset permissions
  useEffect(() => {
    if (useDefaults) {
      setSelectedPermissions(new Set(DEFAULT_ROLE_PERMISSIONS[selectedRole] || []))
    }
  }, [selectedRole, useDefaults])

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(perm)) next.delete(perm)
      else next.add(perm)
      return next
    })
  }

  const toggleGroup = (perms: string[], allSelected: boolean) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      for (const p of perms) {
        if (allSelected) next.delete(p)
        else next.add(p)
      }
      return next
    })
  }

  const handleSave = () => {
    if (!user) return
    updateRole.mutate(
      {
        userId: user.id,
        role: selectedRole,
        permissions: useDefaults ? undefined : Array.from(selectedPermissions),
      },
      {
        onSuccess: () =>
          navigate({ to: '/admin/access-management' }),
      }
    )
  }

  const groupedPermissions = useMemo(() => mergeSmallGroups(groupPermissions(PERMISSIONS)), [])

  // Loading state
  if (isLoadingUsers) {
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
          <div className='flex min-h-[400px] flex-col items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            <p className='mt-2 text-muted-foreground'>Carregando...</p>
          </div>
        </Main>
      </>
    )
  }

  // User not found
  if (!user) {
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
            <p className='text-muted-foreground'>Usuário não encontrado.</p>
            <Button variant='outline' onClick={() => navigate({ to: '/admin/access-management' })}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Voltar
            </Button>
          </div>
        </Main>
      </>
    )
  }

  const defaultPerms = DEFAULT_ROLE_PERMISSIONS[selectedRole] || []
  const hasChanges =
    selectedRole !== user.role ||
    (!useDefaults && !arraysEqual(Array.from(selectedPermissions), user.permissions || []))

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
        {/* Breadcrumb / Back */}
        <div className='mb-6'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate({ to: '/admin/access-management' })}
            className='-ml-2 text-muted-foreground'
          >
            <ArrowLeft className='mr-1 h-4 w-4' />
            Gestão de Acessos
          </Button>
        </div>

        {/* Page header */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
              <ShieldCheck className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                Editar Papel & Permissões
              </h1>
              <p className='text-muted-foreground'>
                {user.firstName} {user.lastName} — {user.email}
              </p>
            </div>
          </div>

          <div className='flex gap-2'>
            <Button
              variant='outline'
              onClick={() => navigate({ to: '/admin/access-management' })}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={updateRole.isPending || !hasChanges}>
              {updateRole.isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className='mr-2 h-4 w-4' />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-[340px_1fr]'>
          {/* ─── Left: Role Selection ─── */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Papel (Role)</CardTitle>
                <CardDescription>
                  Define o nível de acesso geral do usuário.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as UserRole)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  {selectedRole === 'SUPER_ADMIN' &&
                    'Acesso total ao sistema. Use com cautela.'}
                  {selectedRole === 'ADMIN' &&
                    'Acesso administrativo completo, exceto gestão de Super Admins.'}
                  {selectedRole === 'VENDOR' &&
                    'Acesso à área do vendedor/loja e funcionalidades compartilhadas.'}
                  {selectedRole === 'VENDOR_EMPLOYEE' &&
                    'Acesso limitado à área do vendedor, com permissões restritas.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Modo de Permissões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label htmlFor='use-defaults' className='font-medium'>
                      Permissões padrão
                    </Label>
                    <p className='text-xs text-muted-foreground'>
                      Usar o conjunto padrão do papel selecionado
                    </p>
                  </div>
                  <Switch
                    id='use-defaults'
                    checked={useDefaults}
                    onCheckedChange={setUseDefaults}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Resumo</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Papel</span>
                  <Badge variant='secondary'>{ROLE_LABELS[selectedRole]}</Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Permissões</span>
                  <span className='font-medium'>
                    {useDefaults ? defaultPerms.length : selectedPermissions.size} de {PERMISSIONS.length}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Modo</span>
                  <span className='text-xs'>
                    {useDefaults ? 'Padrão do papel' : 'Personalizado'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Right: Permissions grid ─── */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Permissões</CardTitle>
              <CardDescription>
                {useDefaults
                  ? `Usando as ${defaultPerms.length} permissões padrão para ${ROLE_LABELS[selectedRole]}.`
                  : 'Selecione manualmente as permissões para este usuário.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {useDefaults ? (
                /* Default mode — show badges in a nice grid */
                <div className='space-y-6'>
                  {Object.entries(groupedPermissions).map(([group, perms]) => {
                    const activePerms = perms.filter((p) => defaultPerms.includes(p as Permission))
                    if (activePerms.length === 0) return null
                    const meta = MERGED_GROUP_LABELS[group]
                    return (
                      <div key={group}>
                        <div className='mb-2'>
                          <h4 className='text-sm font-semibold'>{meta?.label ?? group}</h4>
                          {meta?.description && (
                            <p className='text-xs text-muted-foreground'>{meta.description}</p>
                          )}
                        </div>
                        <div className='flex flex-wrap gap-1.5'>
                          {activePerms.map((perm) => (
                            <Badge key={perm} variant='secondary' className='text-xs font-normal'>
                              {formatPermLabel(perm)}
                            </Badge>
                          ))}
                        </div>
                        <Separator className='mt-4' />
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* Custom mode — checkboxes in organized groups */
                <div className='space-y-6'>
                  {Object.entries(groupedPermissions).map(([group, perms]) => {
                    const allSelected = perms.every((p) => selectedPermissions.has(p))
                    const someSelected = perms.some((p) => selectedPermissions.has(p))
                    const meta = MERGED_GROUP_LABELS[group]
                    return (
                      <div key={group}>
                        <div className='mb-3 flex items-center justify-between'>
                          <div>
                            <h4 className='text-sm font-semibold'>{meta?.label ?? group}</h4>
                            {meta?.description && (
                              <p className='text-xs text-muted-foreground'>{meta.description}</p>
                            )}
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-7 text-xs'
                            onClick={() => toggleGroup(perms, allSelected)}
                          >
                            {allSelected ? 'Desmarcar Todos' : 'Marcar Todos'}
                          </Button>
                        </div>
                        <div className='grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-3'>
                          {perms.map((perm) => (
                            <div key={perm} className='flex items-center space-x-2'>
                              <Checkbox
                                id={`perm-${perm}`}
                                checked={selectedPermissions.has(perm)}
                                onCheckedChange={() => togglePermission(perm)}
                              />
                              <label
                                htmlFor={`perm-${perm}`}
                                className='cursor-pointer text-xs leading-tight'
                              >
                                {formatPermLabel(perm)}
                              </label>
                            </div>
                          ))}
                        </div>
                        <Separator className='mt-4' />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sorted1 = [...a].sort()
  const sorted2 = [...b].sort()
  return sorted1.every((v, i) => v === sorted2[i])
}
