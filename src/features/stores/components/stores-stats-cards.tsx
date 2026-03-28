import {
  Store,
  CheckCircle,
  Clock,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { StoreStats } from '../data/schema'

interface StoresStatsCardsProps {
  stats?: StoreStats
  isLoading?: boolean
}

export function StoresStatsCards({ stats, isLoading }: StoresStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Lojas',
      value: stats?.total ?? 0,
      icon: Store,
      description: 'Cadastradas no sistema',
    },
    {
      title: 'Ativas',
      value: stats?.active ?? 0,
      icon: CheckCircle,
      description: 'Em operação',
    },
    {
      title: 'Pendentes',
      value: stats?.pending ?? 0,
      icon: Clock,
      description: 'Aguardando aprovação',
    },
    {
      title: 'Destaques',
      value: stats?.featured ?? 0,
      icon: Star,
      description: 'Lojas em destaque',
    },
  ]

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
            <card.icon className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className='text-2xl font-bold'>{card.value}</div>
                <p className='text-muted-foreground text-xs'>
                  {card.description}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
