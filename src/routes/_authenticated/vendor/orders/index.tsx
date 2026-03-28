import { createFileRoute } from '@tanstack/react-router'
import { Orders } from '@/features/orders'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated/vendor/orders/')({
  beforeLoad: () => {
    // Vendor route guard is already applied at /_authenticated/vendor/route.tsx
    // This just ensures we have a storeId to filter
    const { auth } = useAuthStore.getState()
    if (!auth.user?.storeId) {
      console.warn('🚫 Vendor sem loja vinculada tentou acessar pedidos')
    }
  },
  component: VendorOrders,
})

function VendorOrders() {
  const storeId = useAuthStore((s) => s.auth.user?.storeId)
  return <Orders storeId={storeId ?? undefined} />
}
