import { createFileRoute } from '@tanstack/react-router'
import { Zones } from '@/features/zones'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/admin/zones/')({
  beforeLoad: requirePermission('admin.zones.view'),
  component: Zones,
})
