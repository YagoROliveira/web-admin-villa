import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { FeesPage } from '@/features/fees'

const feesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  // Facet filters
  status: z
    .array(z.union([z.literal('active'), z.literal('inactive')]))
    .optional()
    .catch([]),
  feeType: z
    .array(
      z.union([
        z.literal('INSTALLMENT'),
        z.literal('PROCESSING'),
        z.literal('SERVICE'),
      ])
    )
    .optional()
    .catch([]),
  // Per-column text filter
  name: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/fees/')({
  validateSearch: feesSearchSchema,
  component: FeesPage,
})
