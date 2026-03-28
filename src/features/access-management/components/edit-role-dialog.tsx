import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  USER_ROLES,
  PERMISSIONS,
  ROLE_LABELS,
  DEFAULT_ROLE_PERMISSIONS,
} from '@/types/auth'
import type { UserRole, Permission } from '@/types/auth'
import type { PanelUser } from '../data/schema'
import { useUpdateUserRole } from '../hooks/use-panel-users'

interface EditRoleDialogProps {
  user: PanelUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Groups permissions by their namespace prefix (e.g., "admin", "vendor", "wallet", "shared").
 */
function groupPermissions(perms: readonly string[]) {
  const groups: Record<string, string[]> = {}
  for (const p of perms) {
    const prefix = p.split('.')[0] ?? 'other'
    if (!groups[prefix]) groups[prefix] = []
    groups[prefix].push(p)
  }
  return groups
}

const PERMISSION_GROUP_LABELS: Record<string, string> = {
  admin: 'Administração',
  shared: 'Compartilhadas',
  vendor: 'Loja / Vendor',
  wallet: 'Wallet / Financeiro',
}

export function EditRoleDialog({
  user,
  open,
  onOpenChange,
}: EditRoleDialogProps) {
  const updateRole = useUpdateUserRole()
  const [selectedRole, setSelectedRole] = useState<UserRole>('VENDOR_EMPLOYEE')
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  )
  const [useDefaults, setUseDefaults] = useState(true)

  // Sync state when user changes
  useEffect(() => {
    if (user) {
      const role = (user.role as UserRole) || 'VENDOR_EMPLOYEE'
      setSelectedRole(role)
      const currentPerms = user.permissions || []
      const defaults = DEFAULT_ROLE_PERMISSIONS[role] || []
      // Check if current permissions match defaults
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
      setSelectedPermissions(
        new Set(DEFAULT_ROLE_PERMISSIONS[selectedRole] || [])
      )
    }
  }, [selectedRole, useDefaults])

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev)
      if (next.has(perm)) {
        next.delete(perm)
      } else {
        next.add(perm)
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
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  const groupedPermissions = groupPermissions(PERMISSIONS)

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            Editar Papel & Permissões
          </DialogTitle>
          <DialogDescription>
            Alterando acesso de{' '}
            <strong>
              {user.firstName} {user.lastName}
            </strong>{' '}
            ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Role Select */}
          <div className='space-y-2'>
            <Label>Papel (Role)</Label>
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
          </div>

          <Separator />

          {/* Permissions */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label>Permissões</Label>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='use-defaults'
                  checked={useDefaults}
                  onCheckedChange={(checked) => setUseDefaults(!!checked)}
                />
                <label
                  htmlFor='use-defaults'
                  className='cursor-pointer text-sm text-muted-foreground'
                >
                  Usar permissões padrão do papel
                </label>
              </div>
            </div>

            {useDefaults ? (
              <div className='rounded-md border bg-muted/50 p-4'>
                <p className='mb-2 text-sm text-muted-foreground'>
                  Usando as permissões padrão para{' '}
                  <Badge variant='outline'>{ROLE_LABELS[selectedRole]}</Badge>:
                </p>
                <div className='flex flex-wrap gap-1'>
                  {(DEFAULT_ROLE_PERMISSIONS[selectedRole] || []).map((perm) => (
                    <Badge key={perm} variant='secondary' className='text-xs'>
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : (
              <ScrollArea className='h-[300px] rounded-md border p-4'>
                {Object.entries(groupedPermissions).map(([group, perms]) => (
                  <div key={group} className='mb-4'>
                    <h4 className='mb-2 text-sm font-semibold'>
                      {PERMISSION_GROUP_LABELS[group] ?? group}
                    </h4>
                    <div className='grid grid-cols-2 gap-2'>
                      {perms.map((perm) => (
                        <div
                          key={perm}
                          className='flex items-center space-x-2'
                        >
                          <Checkbox
                            id={`perm-${perm}`}
                            checked={selectedPermissions.has(perm)}
                            onCheckedChange={() => togglePermission(perm)}
                          />
                          <label
                            htmlFor={`perm-${perm}`}
                            className='cursor-pointer text-xs'
                          >
                            {perm}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateRole.isPending}>
            {updateRole.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
