import { createFileRoute } from '@tanstack/react-router'
import { Items } from '@/features/items'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/items/')({
  beforeLoad: requirePermission('items.view'),
  component: Items,
})
