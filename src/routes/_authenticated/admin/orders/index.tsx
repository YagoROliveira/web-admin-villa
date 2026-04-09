import { createFileRoute } from '@tanstack/react-router'
import { Orders } from '@/features/orders'

export const Route = createFileRoute('/_authenticated/admin/orders/')({
  validateSearch: (search: Record<string, unknown>) => ({
    status: typeof search.status === 'string' ? search.status : 'all',
  }),
  component: OrdersRoute,
})

function OrdersRoute() {
  const { status } = Route.useSearch()
  return <Orders statusFilter={status} />
}
