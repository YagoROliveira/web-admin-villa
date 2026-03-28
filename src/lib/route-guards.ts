/**
 * Route guard helpers for TanStack Router `beforeLoad` hooks.
 *
 * Usage in a route file:
 * ```ts
 * import { requirePermission, requireRole } from '@/lib/route-guards'
 *
 * export const Route = createFileRoute('/_authenticated/fees/')({
 *   beforeLoad: requirePermission('wallet.fees.view'),
 *   component: FeesPage,
 * })
 * ```
 */

import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import type { Permission, UserRole } from '@/types/auth'

/**
 * Creates a `beforeLoad` guard that checks if the user has a specific permission.
 * Redirects to /403 if the user lacks the permission.
 * SUPER_ADMIN bypasses all permission checks.
 */
export function requirePermission(permission: Permission) {
  return () => {
    const { auth } = useAuthStore.getState()
    const user = auth.user

    if (!user) throw redirect({ to: '/sign-in' })
    if (user.role === 'SUPER_ADMIN') return // Super admin bypasses all
    if (!user.permissions?.includes(permission)) {
      console.warn(
        `🚫 Permissão negada: ${user.email} precisa de "${permission}"`
      )
      throw redirect({ to: '/403' })
    }
  }
}

/**
 * Creates a `beforeLoad` guard that checks if the user has ANY of the given permissions.
 * Redirects to /403 if the user has none of them.
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return () => {
    const { auth } = useAuthStore.getState()
    const user = auth.user

    if (!user) throw redirect({ to: '/sign-in' })
    if (user.role === 'SUPER_ADMIN') return
    const hasAny = permissions.some((p) => user.permissions?.includes(p))
    if (!hasAny) {
      console.warn(
        `🚫 Permissão negada: ${user.email} precisa de uma de [${permissions.join(', ')}]`
      )
      throw redirect({ to: '/403' })
    }
  }
}

/**
 * Creates a `beforeLoad` guard that checks if the user has ALL of the given permissions.
 */
export function requireAllPermissions(...permissions: Permission[]) {
  return () => {
    const { auth } = useAuthStore.getState()
    const user = auth.user

    if (!user) throw redirect({ to: '/sign-in' })
    if (user.role === 'SUPER_ADMIN') return
    const hasAll = permissions.every((p) => user.permissions?.includes(p))
    if (!hasAll) {
      const missing = permissions.filter((p) => !user.permissions?.includes(p))
      console.warn(
        `🚫 Permissão negada: ${user.email} precisa de [${missing.join(', ')}]`
      )
      throw redirect({ to: '/403' })
    }
  }
}

/**
 * Creates a `beforeLoad` guard that checks if the user has one of the given roles.
 */
export function requireRole(...roles: UserRole[]) {
  return () => {
    const { auth } = useAuthStore.getState()
    const user = auth.user

    if (!user) throw redirect({ to: '/sign-in' })
    if (!(roles as string[]).includes(user.role)) {
      console.warn(
        `🚫 Papel insuficiente: ${user.email} (${user.role}) precisa de [${roles.join(', ')}]`
      )
      throw redirect({ to: '/403' })
    }
  }
}
