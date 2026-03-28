import { createFileRoute } from '@tanstack/react-router'
import { Modules } from '@/features/modules'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/admin/modules/')({
  beforeLoad: requirePermission('admin.modules.view'),
  component: Modules,
})
