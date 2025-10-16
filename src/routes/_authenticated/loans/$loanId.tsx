import { createFileRoute } from '@tanstack/react-router'
import { LoanDetails } from '@/features/loans/components/loan-details'

export const Route = createFileRoute('/_authenticated/loans/$loanId')({
  component: LoanDetails,
})
