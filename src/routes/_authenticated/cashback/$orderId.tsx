import { createFileRoute } from '@tanstack/react-router'
import { CashbackDetailsPage } from '@/features/cashback/pages/cashback-details-page'
import { CashbackProvider } from '@/features/cashback/components/cashback-provider'

export const Route = createFileRoute('/_authenticated/cashback/$orderId')({
  component: CashbackDetailsPageRoute,
})

function CashbackDetailsPageRoute() {
  return (
    <CashbackProvider>
      <CashbackDetailsPage />
    </CashbackProvider>
  )
}
