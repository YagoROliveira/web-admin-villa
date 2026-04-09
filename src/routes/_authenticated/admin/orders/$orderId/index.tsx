import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailPage } from '@/features/orders/components/order-detail-page'

export const Route = createFileRoute(
  '/_authenticated/admin/orders/$orderId/'
)({
  component: OrderDetailRoute,
})

function OrderDetailRoute() {
  const { orderId } = Route.useParams()
  return <OrderDetailPage orderId={orderId} />
}
