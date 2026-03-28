import { createFileRoute } from '@tanstack/react-router'
import { ItemDetailPage } from '@/features/items/components/item-detail-page'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/items/$itemId/')({
  beforeLoad: requirePermission('items.view'),
  component: ItemDetailRoute,
})

function ItemDetailRoute() {
  const { itemId } = Route.useParams()
  return <ItemDetailPage itemId={itemId} />
}
