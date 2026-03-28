import { createFileRoute } from '@tanstack/react-router'
import { Chats } from '@/features/chats'
import { requirePermission } from '@/lib/route-guards'

export const Route = createFileRoute('/_authenticated/chats/')({
  beforeLoad: requirePermission('wallet.chats.view'),
  component: Chats,
})
