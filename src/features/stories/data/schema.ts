import { z } from 'zod'

export const storySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SCHEDULED', 'PAUSED', 'CONCLUDED']),
  viewed: z.boolean(),
  startAt: z.string(),
  endAt: z.string(),
  module: z.string(),
  storeId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    order: z.number().optional(),
  })).optional(),
})

export type Story = z.infer<typeof storySchema>

export const statuses = [
  {
    value: 'ACTIVE',
    label: 'Ativo',
    icon: 'CheckCircle',
  },
  {
    value: 'INACTIVE',
    label: 'Inativo',
    icon: 'XCircle',
  },
  {
    value: 'SCHEDULED',
    label: 'Agendado',
    icon: 'Clock',
  },
  {
    value: 'PAUSED',
    label: 'Pausado',
    icon: 'Pause',
  },
  {
    value: 'CONCLUDED',
    label: 'Concluído',
    icon: 'CheckCircle2',
  },
] as const
