import { useNavigate, useLocation } from '@tanstack/react-router'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useLogout } from '@/hooks/use-auth'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const logoutMutation = useLogout()

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        onOpenChange(false)
        // Preserve current location for redirect after sign-in
        const currentPath = location.href
        navigate({
          to: '/sign-in',
          search: { redirect: currentPath },
          replace: true,
        })
      },
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
      isLoading={logoutMutation.isPending}
    />
  )
}
