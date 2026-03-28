import { Clock, LogIn, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserAccessLogs } from '../../hooks/use-user-detail'

interface AccessLogsTabProps {
  userId: string
}

export function AccessLogsTab({ userId }: AccessLogsTabProps) {
  const { data, isLoading } = useUserAccessLogs(userId)

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-48 w-full' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Access Summary */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <LogIn className='h-4 w-4' />
              Último Acesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.lastLoginAt ? (
              <div className='space-y-1'>
                <p className='text-lg font-semibold'>
                  {new Date(data.lastLoginAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className='text-muted-foreground text-sm'>
                  {new Date(data.lastLoginAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>Nunca acessou</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <Calendar className='h-4 w-4' />
              Membro Desde
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.memberSince ? (
              <div className='space-y-1'>
                <p className='text-lg font-semibold'>
                  {new Date(data.memberSince).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p className='text-muted-foreground text-sm'>
                  {Math.floor(
                    (Date.now() - new Date(data.memberSince).getTime()) /
                    (1000 * 60 * 60 * 24),
                  )}{' '}
                  dias como cliente
                </p>
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>Data não disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Access Logs */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Histórico de Acessos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.logs && data.logs.length > 0 ? (
            <div className='space-y-3'>
              {data.logs.map((log: any, index: number) => (
                <div
                  key={index}
                  className='flex items-center gap-4 rounded-lg border p-3'
                >
                  <LogIn className='text-muted-foreground h-4 w-4' />
                  <div className='flex-1'>
                    <p className='text-sm'>
                      {log.action || 'Login'}
                    </p>
                    {log.device && (
                      <p className='text-muted-foreground text-xs'>
                        {log.device}
                      </p>
                    )}
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleDateString('pt-BR')
                      : '—'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center py-8'>
              <Clock className='text-muted-foreground mb-3 h-10 w-10' />
              <p className='text-muted-foreground text-sm'>
                O histórico detalhado de acessos será disponibilizado em breve.
              </p>
              <p className='text-muted-foreground text-xs mt-1'>
                A integração com o módulo de auditoria está em desenvolvimento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
