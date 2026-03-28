import { createFileRoute } from '@tanstack/react-router'
import { Stores } from '@/features/stores'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/admin/stores/')({
  beforeLoad: requirePermission('admin.stores.view'),
  component: Stores,
})
