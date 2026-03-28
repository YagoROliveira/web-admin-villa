import { createFileRoute } from '@tanstack/react-router'
import { Categories } from '@/features/categories'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/admin/categories/')({
  beforeLoad: requirePermission('admin.categories.view'),
  component: Categories,
})
