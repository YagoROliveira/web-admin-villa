/**
 * usePermissions — React hook for permission and role checking.
 *
 * Wraps the auth store's RBAC methods with a cleaner React-friendly API.
 * Use this in components to conditionally render UI based on permissions.
 *
 * @example
 * ```tsx
 * const { hasPermission, isAdmin, user } = usePermissions()
 *
 * // Conditionally show a button
 * {hasPermission('wallet.loans.manage') && <ApproveButton />}
 *
 * // Check role
 * {isAdmin && <AdminBadge />}
 * ```
 */

import { useAuthStore } from '@/stores/auth-store'
import type { Permission, UserRole } from '@/types/auth'
import { ADMIN_ROLES, VENDOR_ROLES, ROLE_LABELS, ROLE_HIERARCHY } from '@/types/auth'

export function usePermissions() {
  const { auth } = useAuthStore()
  const user = auth.user

  /** Check if user has at least one of the specified roles */
  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  /** Check if user has a specific permission */
  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false
    if (user.role === 'SUPER_ADMIN') return true
    return user.permissions?.includes(permission) ?? false
  }

  /** Check if user has ALL of the specified permissions */
  const hasAllPermissions = (...permissions: Permission[]): boolean => {
    return permissions.every((p) => hasPermission(p))
  }

  /** Check if user has ANY of the specified permissions */
  const hasAnyPermission = (...permissions: Permission[]): boolean => {
    return permissions.some((p) => hasPermission(p))
  }

  /** Is the user an admin (SUPER_ADMIN or ADMIN) */
  const isAdmin = hasRole(...ADMIN_ROLES)

  /** Is the user a vendor (VENDOR or VENDOR_EMPLOYEE) */
  const isVendor = hasRole(...VENDOR_ROLES)

  /** Is the user a super admin (highest privilege) */
  const isSuperAdmin = hasRole('SUPER_ADMIN')

  /** Get the human-readable label for the user's role */
  const roleLabel = user ? ROLE_LABELS[user.role] : ''

  /** Check if current user's role is higher or equal to the given role */
  const hasMinimumRole = (minRole: UserRole): boolean => {
    if (!user) return false
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole]
  }

  return {
    user,
    hasRole,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isAdmin,
    isVendor,
    isSuperAdmin,
    roleLabel,
    hasMinimumRole,
  }
}

/**
 * PermissionGate — Component that conditionally renders children based on permissions.
 *
 * @example
 * ```tsx
 * <PermissionGate permission="wallet.loans.manage">
 *   <ApproveLoanButton />
 * </PermissionGate>
 *
 * <PermissionGate roles={['SUPER_ADMIN', 'ADMIN']}>
 *   <AdminPanel />
 * </PermissionGate>
 * ```
 */
interface PermissionGateProps {
  children: React.ReactNode
  /** Permission required */
  permission?: Permission
  /** Any of these permissions required */
  anyPermission?: Permission[]
  /** All of these permissions required */
  allPermissions?: Permission[]
  /** Role(s) required */
  roles?: UserRole[]
  /** Fallback component when access is denied */
  fallback?: React.ReactNode
}

export function PermissionGate({
  children,
  permission,
  anyPermission,
  allPermissions,
  roles,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } =
    usePermissions()

  // Check role restriction
  if (roles && !hasRole(...roles)) return <>{ fallback } </>

  // Check single permission
  if (permission && !hasPermission(permission)) return <>{ fallback } </>

  // Check any permission
  if (anyPermission && !hasAnyPermission(...anyPermission)) return <>{ fallback } </>

  // Check all permissions
  if (allPermissions && !hasAllPermissions(...allPermissions)) return <>{ fallback } </>

  return <>{ children } </>
}
