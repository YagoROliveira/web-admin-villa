import { createFileRoute } from '@tanstack/react-router'
import { Loans } from '@/features/loans'

export const Route = createFileRoute('/_authenticated/loans/')({
  component: Loans,
})
