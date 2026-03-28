import { createFileRoute } from '@tanstack/react-router'
import { Loans } from '@/features/loans'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/loans/')({
  beforeLoad: requirePermission('wallet.loans.view'),
  component: Loans,
})
