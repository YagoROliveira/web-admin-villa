import { createFileRoute } from '@tanstack/react-router'
import { PayableAccounts } from '@/features/payable-accounts'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/payable-accounts/')({
  beforeLoad: requirePermission('wallet.payable_accounts.view'),
  component: PayableAccounts,
})
