import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { VENDOR_ROLES } from '@/types/auth'

/**
 * Vendor route guard.
 *
 * All routes under `/_authenticated/vendor/*` require the user to have
 * a vendor-level role (VENDOR or VENDOR_EMPLOYEE).
 *
 * Admins are redirected to 403 (they should use /admin routes).
 */
export const Route = createFileRoute('/_authenticated/vendor')({
  beforeLoad: () => {
    const { auth } = useAuthStore.getState()
    const user = auth.user

    if (!user) {
      throw redirect({ to: '/sign-in' })
    }

    if (!(VENDOR_ROLES as readonly string[]).includes(user.role)) {
      console.warn(
        `🚫 Acesso negado à área vendor: ${user.email} (role: ${user.role})`
      )
      throw redirect({ to: '/403' })
    }

    console.log(`✅ Acesso vendor autorizado: ${user.email} (role: ${user.role})`)
  },
  component: () => <Outlet />,
})
