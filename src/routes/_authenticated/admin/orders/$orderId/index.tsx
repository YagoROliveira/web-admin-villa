import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailPage } from '@/features/orders/components/order-detail-page'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute(
  '/_authenticated/admin/orders/$orderId/'
)({
  beforeLoad: requirePermission('orders.view'),
  component: OrderDetailRoute,
})

function OrderDetailRoute() {
  const { orderId } = Route.useParams()
  return <OrderDetailPage orderId={orderId} />
}
