import { createFileRoute } from '@tanstack/react-router'
import { Orders } from '@/features/orders'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/admin/orders/')({
  beforeLoad: requirePermission('orders.view'),
  component: () => <Orders />,
})
