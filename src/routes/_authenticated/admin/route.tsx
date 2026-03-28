import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { ADMIN_ROLES } from '@/types/auth'

/**
 * Admin route guard.
 *
 * All routes under `/_authenticated/admin/*` require the user to have
 * an admin-level role (SUPER_ADMIN or ADMIN).
 *
 * Vendors and vendor employees are redirected to 403.
 */
export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const user = auth.user

    if (!user) {
      throw redirect({ to: '/sign-in' })
    }

    if (!(ADMIN_ROLES as readonly string[]).includes(user.role)) {
      console.warn(
        `🚫 Acesso negado à área admin: ${user.email} (role: ${user.role})`
      )
      throw redirect({ to: '/403' })
    }

    console.log(`✅ Acesso admin autorizado: ${user.email} (role: ${user.role})`)
  },
  component: () => <Outlet />,
})
