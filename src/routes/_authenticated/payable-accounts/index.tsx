import { createFileRoute } from '@tanstack/react-router'
import { PayableAccounts } from '@/features/payable-accounts'

export const Route = createFileRoute('/_authenticated/payable-accounts/')({
  component: PayableAccounts,
})
