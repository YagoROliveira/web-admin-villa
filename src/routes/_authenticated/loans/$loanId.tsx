import { LoanDetails } from '@/features/loans/components/loan-details';
import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute('/_authenticated/loans/$loanId')({
  component: LoanDetails,
});
