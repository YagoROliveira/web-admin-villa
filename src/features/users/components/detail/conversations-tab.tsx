import { MessageSquare, Users as UsersIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserConversations } from '../../hooks/use-user-detail'

interface ConversationsTabProps {
  userId: string
}

export function ConversationsTab({ userId }: ConversationsTabProps) {
  const { data: conversations, isLoading } = useUserConversations(userId)

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-20 w-full' />
        ))}
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <Card>
        <CardContent className='py-12'>
          <div className='flex flex-col items-center justify-center space-y-3'>
            <MessageSquare className='text-muted-foreground h-12 w-12' />
            <p className='text-muted-foreground'>Nenhuma conversa encontrada</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <MessageSquare className='h-5 w-5' />
          Histórico de Conversas
          <Badge variant='secondary' className='ml-2'>
            {conversations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {conversations.map((conv) => {
            const otherParticipants = conv.participants.filter(
              (p) => p.userId !== userId,
            )

            return (
              <div
                key={conv.id}
                className='hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-4 transition-colors'
              >
                <div className='flex -space-x-2'>
                  {otherParticipants.slice(0, 3).map((p) => {
                    const initials = p.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                    return (
                      <Avatar key={p.userId} className='h-8 w-8 border-2 border-white'>
                        <AvatarImage src={p.user.avatarUrl ?? undefined} />
                        <AvatarFallback className='text-xs'>{initials}</AvatarFallback>
                      </Avatar>
                    )
                  })}
                </div>

                <div className='flex-1'>
                  <p className='text-sm font-medium'>
                    {otherParticipants.map((p) => p.user.name).join(', ') || 'Conversa'}
                  </p>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline' className='text-xs'>
                      {conv.type}
                    </Badge>
                    <span className='text-muted-foreground text-xs'>
                      <UsersIcon className='mr-1 inline h-3 w-3' />
                      {conv.participants.length} participantes
                    </span>
                  </div>
                </div>

                <div className='text-right'>
                  <p className='text-muted-foreground text-xs'>
                    {new Date(conv.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
