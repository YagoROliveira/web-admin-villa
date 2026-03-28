import { createFileRoute } from '@tanstack/react-router'
import { EditRolePage } from '@/features/access-management/components/edit-role-page'

export const Route = createFileRoute(
  '/_authenticated/admin/access-management/$userId/edit'
)({
  component: EditRoleRoute,
})

function EditRoleRoute() {
  const { userId } = Route.useParams()
  return <EditRolePage userId={userId} />
}
