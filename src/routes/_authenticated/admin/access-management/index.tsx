import { createFileRoute } from '@tanstack/react-router'
import { AccessManagement } from '@/features/access-management'

export const Route = createFileRoute(
  '/_authenticated/admin/access-management/'
)({
  component: AccessManagement,
})
