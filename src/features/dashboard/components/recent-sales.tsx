import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentCashbacks } from '../hooks/use-dashboard-stats'

export function RecentSales() {
  const { data, isLoading } = useRecentCashbacks()

  if (isLoading) {
    return (
      <div className='space-y-8'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='flex items-center gap-4'>
            <Skeleton className='h-9 w-9 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-48' />
            </div>
            <Skeleton className='h-4 w-20' />
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className='flex h-[200px] items-center justify-center'>
        <p className='text-muted-foreground text-sm'>
          Nenhum cashback recente
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {data.map((cashback) => {
        const initials = cashback.userName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return (
          <div key={cashback.id} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9'>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between gap-2'>
              <div className='space-y-1'>
                <p className='text-sm leading-none font-medium'>
                  {cashback.userName}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {cashback.userEmail || 'Email não disponível'}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={
                    cashback.status === 'processed' ? 'default' : 'secondary'
                  }
                  className='text-xs'
                >
                  {cashback.status === 'processed' ? 'Processado' : 'Pendente'}
                </Badge>
                <div className='font-medium text-green-600'>
                  +
                  {cashback.amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
