import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { CashbackProvider } from '@/features/cashback/components/cashback-provider'
import { CashbackPage } from '@/features/cashback/pages/cashback-page'

export const cashbackSearchSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  filter: z.string().optional(),
  status: z.array(z.string()).optional(),
  cashbackType: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_authenticated/cashback/')({
  validateSearch: (search) => cashbackSearchSchema.parse(search),
  component: CashbackRoute,
})

function CashbackRoute() {
  return (
    <CashbackProvider>
      <CashbackPage />
    </CashbackProvider>
  )
}

