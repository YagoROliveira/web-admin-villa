import { createFileRoute } from '@tanstack/react-router'
import { CustomerDetailPage } from '@/features/customers/pages/customer-detail-page'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/admin/customers/$userId')({
  beforeLoad: requirePermission('admin.customers.view'),
  component: CustomerDetailPage,
})
